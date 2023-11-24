$(document).ready(function () {

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

        // get all checked application ids, need to do this for bulk delete with xata
        $operations = [];
        $('input[type="checkbox"]:checked').each(function () {
            $operation = {
                'delete': {
                    'table': 'Applications',
                }
            }
            $operation['delete']['id'] = ($(this).val());
            $operations.push($operation);
        });

        // send delete request to server
        $.ajax({
            url: '/deleteapp',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ ops: $operations }),
            success: function (result) {
                // remove row from table
                $operations.forEach(function (op) {
                    $('#' + op['delete']['id']).remove();
                });
            },
            error: function () {
                // TODO implement error handling
                // create an alert on the page
                console.log('error');
            }
        });
    });

    // Handle click event for updating an application
    $('#saveappbtn').click(function () {
        // get id of application to update
        $id = $('#saveapplicationid').val();
        // get updated application details
        $company = $('#application-modal #company').val();
        $position = $('#application-modal #position').val();
        $postingLink = $('#application-modal #posting-link').val();
        // text for title case
        $status = $('#application-modal #status').find(':selected').text();
        $desc = $('#application-modal #description').val();
        // send update request to server
        $.ajax({
            url: '/updateapp',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id: $id,
                company: $company,
                position: $position,
                postingLink: $postingLink,
                status: $status,
                desc: $desc
            }),
            success: function (result) {
                // update app
                $cols = $(this).children();
                $cols.eq(1).text($status);
                $cols.eq(2).text($company)
                $cols.eq(3).text($position)
                $cols.eq(4).text($desc)
                $cols.eq(5).find('a').attr('href', $postingLink)
                $('#application-modal').modal('hide');
            },
            error: function () {
                // show error message
                $errorMsg = 'Error saving application';
                $error = `<div class="alert alert-danger alert-dismissible  w-50 mx-auto fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                $('#errors').append($error);
            }
        });
    });

    // Handle click event for adding an application
    $('#addappbtn').click(function () {
        // get new application details
        $company = $('#new-application-modal #company').val();
        $position = $('#new-application-modal #position').val();
        $postingLink = $('#new-application-modal #posting-link').val();
        // text for title case
        $status = $('#new-application-modal #status').find(':selected').text();
        $desc = $('#new-application-modal #description').val();
        // send request to server
        $.ajax({
            url: '/newapp',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                company: $company,
                position: $position,
                postingLink: $postingLink,
                status: $status,
                desc: $desc
            }),
            success: function (result) {
                // create new application row
                $newApp = $('<tr></tr>').attr('id', result.id);
                $newApp.append($('<td></td>').append($('<input>').attr('type', 'checkbox').val(result.id)));
                $newApp.append($('<td></td>').attr('id', result.id).append($('<i></i>').addClass('fa-solid').addClass('fa-pen-to-square').attr('id', 'edit')));
                $newApp.append($('<td></td>').text($status));
                $newApp.append($('<td></td>').text($company));
                $newApp.append($('<td></td>').text($position));
                $newApp.append($('<td></td>').text($desc));
                $newApp.append($('<td></td>').append($('<a></a>').attr('href', $postingLink).attr('target', '_blank').addClass('posting-link').append($('<i></i>').addClass('fa-solid').addClass('fa-link'))));


                // add new application row to table
                $('table').append($newApp);

                // clear modal inputs
                $('#new-application-modal #company').val('');
                $('#new-application-modal #position').val('');
                $('#new-application-modal #posting-link').val('');
                $('#new-application-modal #status').val('Applied');
                $('#new-application-modal #description').val('');

                // hide modal
                $('#new-application-modal').modal('hide');
            },
            error: function () {
                // show error message
                $errorMsg = 'Error adding application';
                $error = `<div class="alert alert-danger alert-dismissible  w-50 mx-auto fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                $('#errors').append($error);
            }
        });
    });
}); // end of document ready

// Have to do this because the application cards are dynamically created
$(document).on('click', 'tbody tr', function () {
    // get application details from table row
    $cols = $(this).children();
    console.log($cols);
    $status = $cols.eq(1).text();
    $company = $cols.eq(2).text();
    $position = $cols.eq(3).text();
    $desc = $cols.eq(4).text();
    $postingLink = $cols.eq(5).find('a').attr('href');

    // update title of modal
    $('#application-modal .modal-title').text($company + ' - ' + $position);

    // update the selected option in the status dropdown
    $('#application-modal #status').find('option').each(function () {
        if ($(this).val() == $status) {
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
    $('#saveapplicationid').val($id);

    // show modal
    $('#application-modal').modal('show');
});