$(document).ready(function () {

    // get rows for default order
    $originalrows = $('tbody tr');

    $('#status-sort').click(function () { sortRows($(this)); });
    $('#company-sort').click(function () { sortRows($(this)); });
    $('#position-sort').click(function () { sortRows($(this)); });
    $('#date-sort').click(function () { sortRows($(this)); });
});

function sortRows(col) {
    $colIdx = col.parent().index();
    $rows = $('tbody tr');
    console.log($colIdx);
    if (col.hasClass('fa-sort')) {
        // do ascending sort on rows based on column index
        $sorted = [...$rows].sort(function (a, b) {
            $aVal = $(a).children().eq($colIdx).text();
            $bVal = $(b).children().eq($colIdx).text();
            return $aVal.localeCompare($bVal);
        });
        $('tbody').empty();
        $('tbody').append($sorted);
        col.removeClass('fa-sort').addClass('fa-sort-up');
    } else if (col.hasClass('fa-sort-up')) {
        // do descending sort on rows based on column index
        col.removeClass('fa-sort-up').addClass('fa-sort-down');
        $sorted = [...$rows].sort(function (a, b) {
            $aVal = $(a).children().eq($colIdx).text();
            $bVal = $(b).children().eq($colIdx).text();
            return $bVal.localeCompare($aVal);
        });
        $('tbody').empty();
        $('tbody').append($sorted);
    } else {
        // replace rows with default order
        col.removeClass('fa-sort-down').addClass('fa-sort');
        $('tbody').empty();
        $('tbody').append($originalrows);
    }
}