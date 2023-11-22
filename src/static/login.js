$(document).ready(function () {
    // handle login
    $('#loginbtn').click(function () {
        // get user input
        $email = $('#loginEmail').val();
        $password = $('#loginPassword').val();
        // send login request to server
        $.ajax({
            url: '/login',
            type: 'POST',
            data: {
                email: $email,
                password: $password
            },
            success: function (result) {
                // redirect to dashboard
                window.location.href = '/dashboard';
            },
            error: function (xhr) {
                if (xhr.status == 400) {
                    // change border color of input fields
                    $('#loginEmail').addClass('is-invalid');
                    $('#loginPassword').addClass('is-invalid');
                    // show invlaid credentials error message
                    $errorMsg = 'Incorrect email or password';
                    $error = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                    // add error message to modal body
                    $('#loginModal .modal-body').prepend($error);
                } else if (xhr.status == 500) {
                    // show db error message
                    $errorMsg = 'Database error';
                    $error = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                    // add error message to modal body
                    $('#loginModal .modal-body').prepend($error);
                }
            }
        });
    });
});