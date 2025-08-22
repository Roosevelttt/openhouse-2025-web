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
  async function validatePayment(): Promise<void> {
    isLoading = true;

    try {
      const requestBody = { nrp, ukm };

      // The post helper now directly returns the data we need or throws an error.
      // No more manual response checking!
      const data = await post<PaymentValidationResponse>(
        "/api/payment/validate",
        requestBody,
      );

      // If we get here, the request was successful (res.ok was true)
      if (data.message === "true") {
        await Swal.fire({
          title: "Payment Validated Successfully",
          text: `NRP: ${nrp}`,
          icon: "success",
        });
        window.location.reload();
      } else if (data.message === "false") {
        Swal.fire({
          title: "Payment has been Validated",
          text: `NRP: ${nrp}`,
          icon: "error",
        });
      } else if (data.message === "not_yet") {
        Swal.fire({
          title: "The selection file hasn't been validated",
          text: `NRP: ${nrp}`,
          icon: "warning",
        });
      } else {
        // 'warning' case from the backend
        Swal.fire({
          title: "This participant has been rejected",
          text: `NRP: ${nrp}`,
          icon: "error",
        });
      }
    } catch (error: unknown) {
      // The catch block now handles ALL errors (network, 4xx, 5xx)
      console.error("Fetch operation failed:", error);
      Swal.fire({
        title: "Request Failed",
        text:
          error instanceof Error ? error.message : "An unknown error occurred.",
        icon: "error",
      });
    } finally {
      isLoading = false;
    }
  }

  function handleValidate() {
    Swal.fire({
      title: "Which to validate?",
      text: `${nrp}`,
      icon: "question",
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonColor: "#4ed630",
      denyButtonColor: "#30aad6",
      confirmButtonText: "SELECTION",
      denyButtonText: "PAYMENT",
    }).then((result) => {
      if (result.isDenied) {
        validatePayment();
      }
    });
  }
</script>

<button
  class="rounded bg-green-500 p-1 text-white hover:bg-green-400 active:bg-green-600"
  onclick={handleValidate}
  disabled={isLoading}
>
  {#if isLoading}
    Validating...
  {:else}
    Validate Payment
  {/if}
</button>
