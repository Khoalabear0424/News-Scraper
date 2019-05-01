// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var request = require("request");
var cheerio = require("cheerio");
var app = express();

// app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.static("public"));


// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedDataNYTimes"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    db.scrapedDataNYTimes.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.render('pages/home', {
                articles: found
            });
            // res.send(found)
        }
    });
});

app.get("/scrape-page", function (req, res) {
    request('https://www.nytimes.com/section/technology', function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log(body); // Print the HTML for the Google homepage.

        const $ = cheerio.load(body);
        // console.log($('article h2'))
        $('article').each(function (i, elem) {
            if ($(this).find('p').html()) {
                console.log('h2 :' + $(this).find('h2').text())
                console.log('p :' + $(this).find('p').text())
                console.log('href :' + $(this).find('a').attr('href'))
                console.log('img src :' + $(this).find('img').attr('src'))

                db.scrapedDataNYTimes.insert({
                    title: $(this).find('h2').text(),
                    summary: $(this).find('p').text(),
                    link: 'https://www.nytimes.com' + $(this).find('a').attr('href'),
                    img: $(this).find('img').attr('src')
                }, function (error, newArticle) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log(`Added ${newArticle}`);
                    }
                })
            }
        })
    });
})

// Retrieve data from the db
app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedDataNYTimes.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});











// app.post("/article", function (req, res) {
//     db.scrapedData.insert({ name: "khoa" }, function (error, newArticle) {
//         if (error) {
//             console.log(error)
//         } else {
//             res.json(newArticle);
//         }
//     })
// })











// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://news.ycombinator.com/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        // For each element with a "title" class
        $(".title").each(function (i, element) {
            // Save the text and href of each link enclosed in the current element
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");

            // If this found element had both a title and a link
            if (title && link) {
                // Insert the data in the scrapedData db
                db.scrapedData.insert({
                    title: title,
                    link: link
                },
                    function (err, inserted) {
                        if (err) {
                            // Log the error if one is encountered during the query
                            console.log(err);
                        }
                        else {
                            // Otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
            }
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
