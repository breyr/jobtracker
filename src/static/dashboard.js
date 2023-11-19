$(document).ready(function () {
    // show modal for when user clicks on an application card
    $('.application').click(function () {
        // update modal title
        $company = $(this).find('.company').text();
        $position = $(this).find('.position').text();
        $('#application-modal .modal-title').text($company + ' - ' + $position);

        // update modal body to have the application details in a form that can be edited
        $company = $(this).find('.company').text().trim();
        $position = $(this).find('.position').text();
        $postingLink = $(this).find('.posting-link').attr('href');
        $status = $(this).parent().parent().find('h2').text();
        $oOrR = '';
        if ($status == 'Offer/Rejected') {
            $(this).hasClass('offer') ? $oOrR = 'Offered' : $oOrR = 'Rejected';
        }
        $desc = $(this).find('.description').text();

        // update modal body

        // update the selected option in the status dropdown
        $('#application-modal #status').find('option').each(function () {
            if ($(this).text() == $status || $(this).text() == $oOrR) {
                $(this).attr('selected', 'selected');
            }
        });

        // populate modal body with application details
        $('#application-modal #company').val($company);
        $('#application-modal #position').val($position);
        $('#application-modal #posting-link').val($postingLink);
        $('#application-modal #description').val($desc);

        // insert application row id into application delete form
        $id = $(this).attr('id');
        $('#delapplicationid').val($id);
        $('#saveapplicationid').val($id);

        // show modal
        $('#application-modal').modal('show');
    });

    // Handle click event for the close button
    $('#application-modal #closeappbtn').click(function () {
        $('#application-modal').modal('hide');
    });

    // Handle click event for the add application button
    $('#add-application-btn').click(function () {
        $('#new-application-modal').modal('show');
    });

    // Handle click event for the close button
    $('#new-application-modal #closeappbtn').click(function () {
        $('#new-application-modal').modal('hide');
    });

    // Handle click event for deleting an application
    $('#deleteappbtn').click(function () {
        // get id of application to delete
        $id = $('#delapplicationid').val();
        // send delete request to server
        $.ajax({
            url: '/deleteapp',
            type: 'POST',
            data: { id: $id },
            success: function (result) {
                // remove application card from page
                $('#' + $id).remove();
                // hide modal
                $('#application-modal').modal('hide');
            },
            error: function () {
                // TODO implement error handling
                // create an alert on the page
                console.log('error');
            }
        });
    });

    // Handle click event for saving an application
    $('#saveappbtn').click(function () {
        // get id of application to update
        $id = $('#saveapplicationid').val();
        // get updated application details
        $company = $('#application-modal #company').val();
        $position = $('#application-modal #position').val();
        $postingLink = $('#application-modal #posting-link').val();
        $status = $('#application-modal #status').find(':selected').text();
        $desc = $('#application-modal #description').val();
        // send update request to server
        $.ajax({
            url: '/updateapp',
            type: 'POST',
            data: {
                id: $id,
                company: $company,
                position: $position,
                postingLink: $postingLink,
                status: $status,
                desc: $desc
            },
            success: function (result) {
                // update application card on page
                $('#' + $id).find('.company').text($company);
                $('#' + $id).find('.position').text($position);
                $('#' + $id).find('.posting-link').attr('href', $postingLink);
                $('#' + $id).find('.description').text($desc);
                // hide modal
                $('#application-modal').modal('hide');
            },
            error: function () {
                // TODO implement error handling
                // create an alert on the page
                console.log('error');
            }
        });
    });
});