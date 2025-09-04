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

      console.log(data);

      // If we get here, the request was successful (res.ok was true)
      if (data.message === "true") {
        await Swal.fire({
          title: `${fileType[type]} Validated Successfully`,
          text: `NRP: ${nrp}`,
          icon: "success",
        });
        window.location.reload();
      } else {
        // 'warning' case from the backend
        Swal.fire({
          title: "An unknown error occurred",
          text: data.message || "An unknown error occurred.",
          icon: "error",
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
      confirmButtonColor: "#4ed630",
      denyButtonColor: "#cf142b",
      confirmButtonText: "YES",
      denyButtonText: "CANCEL",
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
  class="rounded bg-green-500 p-1 text-white hover:bg-green-400 active:bg-green-600"
  onclick={handleValidate}
  disabled={isLoading}
>
  {#if isLoading}
    Validating...
  {:else}
    Validate
  {/if}
</button>
