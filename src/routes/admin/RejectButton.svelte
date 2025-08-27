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
  async function reject(type: "payment" | "file"): Promise<void> {
    isLoading = true;

    try {
      const requestBody = { nrp, ukm, type };

      // The post helper now directly returns the data we need or throws an error.
      // No more manual response checking!
      const data = await post<PaymentValidationResponse>(
        "/api/payment/reject",
        requestBody,
      );

      console.log(data);

      // If we get here, the request was successful (res.ok was true)
      if (data.message === "true") {
        if (type === "file") {
          await Swal.fire({
            title: "Selection Rejected Successfully",
            text: `NRP: ${nrp}`,
            icon: "success",
          });
        } else {
          await Swal.fire({
            title: "Payment Rejected Successfully",
            text: `NRP: ${nrp}`,
            icon: "success",
          });
        }
        window.location.reload();
      } else {
        // 'warning' case from the backend
        Swal.fire({
          title: "An unknown error occurred",
          text: data.message || "An unknown error occurred.",
          icon: "error",
        });
      }
    } catch (error: Error | any) {
      const errors: Record<string, string> = {
        false: "Payment has been validated",
      };
      const errorMessage =
        errors[JSON.parse(error.message).message] ||
        "An unknown error occurred.";
      console.error("Fetch operation failed:", error);
      Swal.fire({
        title: "Request Failed",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      isLoading = false;
    }
  }

  function handleReject() {
    Swal.fire({
      title: "Which to reject?",
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
        reject("payment");
      } else if (result.isConfirmed) {
        reject("file");
      }
    });
  }
</script>

<button
  class="rounded bg-red-500 p-1 text-white hover:bg-red-400 active:bg-red-600"
  onclick={handleReject}
  disabled={isLoading}
>
  {#if isLoading}
    Rejecting...
  {:else}
    Reject
  {/if}
</button>
