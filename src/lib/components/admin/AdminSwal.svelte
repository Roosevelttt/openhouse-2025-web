<script>
    import Swal from "sweetalert2";
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    onMount( async () => {
      const error = $page.url.searchParams.get('error');
      const success = $page.url.searchParams.get('success');
      
      let title = "Unknown Error"
      let message = ""
      let icon = "error"

      if (error || success) {
        if (error) {

          if (error === 'admin_required') {
            title = "Admin access required"
            message = 'Please login with an admin account.';
          } else if (error === 'session_error') {
            title = "Session error"
            message = 'Please login again.';
          } else if (error === 'not_student') {
            title = "Forbidden"
            message = 'Only PCU students can login.';
          }

        } else if (success) {

          icon = "success"

          if (success === 'success_login') {
            title = "Login successful"
            message = 'You can now register!🎉';
          }
          
        }

        Swal.fire({
          title: title,
          text: message,
          icon: icon,
          customClass: {
            container: 'admin-swal',
            popup: 'admin-swal-modal',
            title: 'admin-swal-title',
            htmlContainer: 'admin-swal-html-container',
            input: 'admin-swal-input',
            actions: 'admin-swal-actions',
            confirmButton: 'admin-swal-confirm',
            cancelButton: 'admin-swal-cancel',
            denyButton: 'admin-swal-deny',
            icon: `admin-swal-icon admin-swal-${icon}`,
            closeButton: 'admin-swal-close',
            validationMessage: 'admin-swal-validation-message'
          }
        });
      }
  });
</script>