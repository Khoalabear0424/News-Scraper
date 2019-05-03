
$('.btn-success').on('click', function () {
    $.ajax({
        url: '/save-item',
        method: 'POST',
        data: {
            item_id: $(this).attr('data-id')
        }
    }).then(function (response) {
        console.log(response);
        console.log('made it ajax');
    });
})