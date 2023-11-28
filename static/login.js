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
            success: function (response) {
                // redirect to dashboard
                window.location.href = '/dashboard';
            },
            error: function (response) {
                $errorMsg = '';
                switch (response.responseJSON.error) {
                    case 'INVALID_LOGIN_CREDENTIALS':
                        $errorMsg = 'Incorrect username or password';
                        break;
                    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                        $errorMsg = 'Too many attempts. Try again later';
                        break;
                    default:
                        break;
                }
                if (response.status == 400) {
                    // change border color of input fields
                    $('#loginEmail').addClass('is-invalid');
                    $('#loginPassword').addClass('is-invalid');
                    $error = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
                        ${$errorMsg} <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button></div>`;
                    // add error message to modal body
                    $('#loginModal .modal-body').prepend($error);
                } else if (response.status == 500) {
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