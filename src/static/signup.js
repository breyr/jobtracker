$(document).ready(function () {

    // handle signup
    $('#signupbtn').click(function () {
        // get user input
        $email = $('#signupEmail').val();
        $password = $('#signupPassword').val();
        // send signup request to server
        $.ajax({
            url: '/register',
            type: 'POST',
            data: {
                email: $email,
                password: $password
            },
            success: function (response) {
                // redirect to dashboard
                window.location.href = '/dashboard';
            },
            error: function (response) {
                $errorMsg = '';
                switch (response.responseJSON.error) {
                    case 'EMAIL_EXISTS':
                        $errorMsg = 'Email already exists';
                        break;
                    case 'OPERATION_NOT_ALLOWED':
                        $errorMsg = 'Password sign-in is disabled';
                        break;
                    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                        $errorMsg = 'Too many attempts. Try again later';
                        break;
                    default:
                        break;
                }
                if (response.status == 400) {
                    // change border color of input fields
                    $('#signupEmail').addClass('is-invalid');
                    $error = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                    // add error message to modal body
                    $('#signupModal .modal-body').prepend($error);
                } else if (response.status == 500) {
                    // show db error message
                    $errorMsg = 'Database error';
                    $error = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                    // add error message to modal body
                    $('#signupModal .modal-body').prepend($error);
                }
            }
        });
    });
});