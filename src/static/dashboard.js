// this row class help with sorting
// only need to sort by status, company, position, date, and keep rownode for easy display
class Row {
    constructor(rownode, status, company, position, date) {
        this.rownode = rownode;
        this.columns = {
            status: status,
            company: company,
            position: position,
            date: date
        }
        this.selectedCol = null;
    }
}


$(document).ready(function () {

    // get original rows for default ordering within rowObjects
    $originalrows = $('tbody tr');

    // create hash table of row objects for easy access (update, delete, etc.)
    $rowObjects = {};

    $originalrows.each(function () {
        // Create row object
        $id = $(this).attr('id');
        $cols = $(this).find('td');
        $status = $cols.eq(1).text();
        $company = $cols.eq(2).text();
        $position = $cols.eq(3).text();
        $date = $cols.eq(6).text();
        $row = new Row($(this), $status, $company, $position, $date);
        $rowObjects[$id] = $row;
    });

    // sorting clicks
    $('th i').click(function () {
        // if delete column then do nothing
        if ($(this).hasClass('fa-trash-can'))
            return;
        // update selected column
        $updateSelectedColumn($(this).parent().attr('id'), $rowObjects);
        // sort rows
        $pq = $handleSort($(this), $rowObjects);
        // update ui
        $handleUiUpdate($pq, $rowObjects);
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

        if (confirm(`Are you sure you want to delete ${$operations.length} applications?`)) {
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
                        //  remove row from row objects and origional rows
                        delete $rowObjects[op['delete']['id']];
                    });
                },
                error: function () {
                    // TODO implement error handling
                    // create an alert on the page
                    console.log('error');
                }
            });
        }
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
            success: function (response) {
                // update app
                $cols = $('#' + $id).children();
                $cols.eq(1).text($status);
                $cols.eq(2).text($company);
                $cols.eq(3).text($position);
                $cols.eq(4).text($desc);
                $cols.eq(5).find('a').attr('href', $postingLink);
                // format date
                $date = new Date(response.updated_at);
                $date = $date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
                $cols.eq(6).text($date);
                $('#application-modal').modal('hide');

                // create new row object, do this here to get the updated row node after updating columns above
                $row = new Row($("#" + $id), $status, $company, $position, $date);
                // update row object and row in original rows
                $rowObjects[$id] = $row;
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
            success: function (response) {
                // create new application row
                $newApp = $('<tr></tr>').attr('id', response.id);
                $newApp.append($('<td></td>').append($('<input>').attr('type', 'checkbox').val(response.id)));
                $newApp.append($('<td></td>').text($status));
                $newApp.append($('<td></td>').text($company));
                $newApp.append($('<td></td>').text($position));
                $newApp.append($('<td></td>').text($desc));
                $newApp.append($('<td></td>').append($('<a></a>').attr('href', $postingLink).attr('target', '_blank').addClass('posting-link').append($('<i></i>').addClass('fa-solid').addClass('fa-link'))));
                // format date
                $date = new Date(response.updated_at);
                $date = $date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
                $newApp.append($('<td></td>').text($date));

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

                // create new row object
                $row = new Row($newApp, $status, $company, $position, $date);
                // add to rowObjects
                $rowObjects[response.id] = $row;
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
$(document).on('click', 'tbody tr', function (event) {

    // if the checkbox was clicked do nothing
    if ($(event.target).is('input') || $(event.target).is('i')) {
        return;
    }

    // get application details from table row
    $cols = $(this).children();
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

// FUNCTIONS FOR SORTING
// r1 and r2 are Row objects, have to compare by the selectedCol
$compareStringsAsc = function (r1, r2) {
    $r1Val = r1.columns[r1.selectedCol];
    $r2Val = r2.columns[r2.selectedCol];
    console.log($r1Val, $r2Val);
    if ($r1Val < $r2Val) { return -1; } else if ($r1Val > $r2Val) { return 1; } else { return 0; }
}

$compareStringsDesc = function (r1, r2) {
    $r1Val = r1.columns[r1.selectedCol];
    $r2Val = r2.columns[r2.selectedCol];
    if ($r1Val < $r2Val) { return 1; } else if ($r1Val > $r2Val) { return -1; } else { return 0; }
}

$compareDatesAsc = function (r1, r2) {
    $r1Val = r1.columns[r1.selectedCol];
    $r2Val = r2.columns[r2.selectedCol];
    // can just subtract because $r1Val and $r2Val are Date objects
    return $r1Val - $r2Val;
}

$compareDatesDesc = function (r1, r2) {
    $r1Val = r1.columns[r1.selectedCol];
    $r2Val = r2.columns[r2.selectedCol];
    // can just subtract because $r1Val and $r2Val are Date objects
    return $r2Val - $r1Val;
}

$updateSelectedColumn = function (col, rowObjects) {
    // update selected column for all row objects
    for (const [key, value] of Object.entries(rowObjects)) {
        value.selectedCol = col;
    }
}

$appendInOriginalOrder = function (rowObjects) {
    for (const [key, value] of Object.entries(rowObjects)) {
        $('tbody').append(value.rownode);
    }
}

$handleSort = function (iNode, rowObjects) {
    // create a list of row objecst from rowObjects
    $rows = [];
    for (const [key, value] of Object.entries(rowObjects)) {
        $rows.push(value);
    }
    // based on icon in column header, sort rows
    $pq = null;
    if (iNode.hasClass('fa-sort')) {
        // do ascending sort on rows based on column index
        $pq = new PriorityQueue({ initialValues: [...$rows], comparator: $compareStringsAsc });
        iNode.removeClass('fa-sort').addClass('fa-sort-up');
    } else if (iNode.hasClass('fa-sort-up')) {
        // do descending sort on rows based on column index
        $pq = new PriorityQueue({ initialValues: [...$rows], comparator: $compareStringsDesc });
        iNode.removeClass('fa-sort-up').addClass('fa-sort-down');
    } else {
        // replace rows with default order
        iNode.removeClass('fa-sort-down').addClass('fa-sort');
        $('tbody').empty();
        $appendInOriginalOrder(rowObjects);
    }
    return $pq;
}

$handleUiUpdate = function (pq, rowObjects) {
    // update table with sorted rows
    $('tbody').empty();
    if (pq === null) {
        $appendInOriginalOrder(rowObjects);
        return;
    }
    // append rows in order
    while (pq.length > 0) {
        $row = pq.dequeue();
        $('tbody').append($row.rownode);
    }
}