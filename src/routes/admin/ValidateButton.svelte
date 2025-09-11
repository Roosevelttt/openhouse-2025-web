<script lang="ts">
  import { post } from "$lib/api";
  import Swal from "sweetalert2";

  let { nrp, ukm } = $props();

  // --- Type Definitions ---
  // It's good practice to keep types close to where they are used.
  interface PaymentValidationResponse {
    message: "true" | "false" | "not_yet" | string;
  }

  // Props to pass NRP and UKM to this component

  let isLoading = $state(false);

  // --- The Refactored Fetch Function ---
  async function validate(type: "payment" | "file"): Promise<void> {
    isLoading = true;

    const fileType = {
      file: "Selection",
      payment: "Payment",
    };

    try {
      const requestBody = { nrp, ukm, type };

      // The post helper now directly returns the data we need or throws an error.
      // No more manual response checking!
      const data = await post<PaymentValidationResponse>(
        "/api/admin/payment/validate",
        requestBody,
      );


      // If we get here, the request was successful (res.ok was true)
      if (data.message === "true") {
        await Swal.fire({
          title: `${fileType[type]} Validated Successfully`,
          text: `NRP: ${nrp}`,
          icon: "success",
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
            icon: 'admin-swal-icon admin-swal-success',
            closeButton: 'admin-swal-close',
            validationMessage: 'admin-swal-validation-message'
          }
        });
        window.location.reload();
      } else {
        // 'warning' case from the backend
        Swal.fire({
          title: "An unknown error occurred",
          text: data.message || "An unknown error occurred.",
          icon: "error",
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
            icon: 'admin-swal-icon admin-swal-error',
            closeButton: 'admin-swal-close',
            validationMessage: 'admin-swal-validation-message'
          }
        });
      }
    } catch (error: any) {
      let errorMessage: string = "An unknown error occurred.";

      try {
        const parsed = JSON.parse(error.message);
        errorMessage = parsed.message || parsed.error || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      console.error("Fetch operation failed:", error);

      Swal.fire({
        title: "Request Failed",
        text: errorMessage,
        icon: "error",
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
          icon: 'admin-swal-icon admin-swal-error',
          closeButton: 'admin-swal-close',
          validationMessage: 'admin-swal-validation-message'
        }
      });
    } finally {
      isLoading = false;
    }
  }

  function handleValidate() {
    Swal.fire({
      title: "Are you sure to Accept?",
      text: `${nrp}`,
      icon: "question",
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonText: "YES",
      denyButtonText: "CANCEL",
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
        icon: 'admin-swal-icon admin-swal-question',
        closeButton: 'admin-swal-close',
        validationMessage: 'admin-swal-validation-message'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        validate("payment");
        // // Gak jadi dipake oeeee apaan
        // } else if (result.isConfirmed) {
        //   validate("file");
      }
    });
  }
</script>

<button
  class="admin-action-btn admin-action-btn-success"
  onclick={handleValidate}
  disabled={isLoading}
>
  {#if isLoading}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 animate-spin">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
    Processing...
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
    Accept
  {/if}
</button>
