<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentUserInfo, getUserBiodata, updateUserBiodata, get, post } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Swal from "sweetalert2";

	let loading = true;
	let error = '';
	let success = '';
	let isEditMode = false;
	let hasExistingData = false;
	
	// Get redirect URL from query params
	$: redirectUrl = $page.url.searchParams.get('redirect');
	$: ukmSlug = $page.url.searchParams.get('ukm_slug');
	
	// Form data
	let formData = {
		name: '',
		nrp: '',
		line_id: '',
		phone: ''
	};

	// Form validation
	let formErrors = {
		line_id: '',
		phone: ''
	};

	onMount(async () => {
		try {
			// Get user info from session
			const userInfo = await getCurrentUserInfo();
			if (userInfo) {
				formData.name = userInfo.name;
				formData.nrp = userInfo.nrp;
				
				// Try to load existing biodata
				const existingBiodata = await getUserBiodata();
				if (existingBiodata && existingBiodata.line_id && existingBiodata.phone) {
					// User has existing complete biodata
					formData.line_id = existingBiodata.line_id;
					formData.phone = existingBiodata.phone;
					hasExistingData = true;
					isEditMode = false; // Start in view mode
				} else {
					// User doesn't have complete biodata
					hasExistingData = false;
					isEditMode = true; // Start in edit mode
				}
			} else {
				error = 'Please log in to access the biodata form';
			}
		} catch (e) {
			console.error('Error loading user info:', e);
			error = 'Not logged in. Please authenticate to access this page.';
		} finally {
			loading = false;
		}
	});

	const validateForm = () => {
		formErrors = {
			line_id: '',
			phone: ''
		};

		let isValid = true;

		// Validate Line ID
		if (!formData.line_id.trim()) {
			formErrors.line_id = 'Line ID is required';
			isValid = false;
		} else if (formData.line_id.length < 3) {
			formErrors.line_id = 'Line ID must be at least 3 characters';
			isValid = false;
		}

		// Validate Phone
		if (!formData.phone.trim()) {
			formErrors.phone = 'Phone number is required';
			isValid = false;
		} else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
			formErrors.phone = 'Please enter a valid phone number';
			isValid = false;
		} else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
			formErrors.phone = 'Phone number must be at least 10 digits';
			isValid = false;
		}

		return isValid;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			loading = true;
			error = '';
			success = '';

			// Show loading swal
			Swal.fire({
				title: 'Saving Biodata...',
				text: 'Please wait while we save your information',
				allowOutsideClick: false,
				didOpen: () => {
					Swal.showLoading();
				}
			});

			// Call API to save biodata
			const result = await updateUserBiodata(formData.line_id, formData.phone);
			
			if (result.success) {
				success = result.message;
				hasExistingData = true;
				
				if (isEditMode && hasExistingData) {
					// If we were editing existing data, go back to view mode after saving
					await Swal.fire({
						icon: 'success',
						title: 'Biodata Updated!',
						text: 'Your information has been updated successfully',
						timer: 1500,
						showConfirmButton: false
					});
					
					isEditMode = false;
					success = '';
				} else {
					// If this was initial biodata creation, redirect based on where they came from
					await Swal.fire({
						icon: 'success',
						title: 'Biodata Saved!',
						text: 'Your information has been saved successfully',
						timer: 1500,
						showConfirmButton: false
					});
					
					// Show redirect loading
					Swal.fire({
						title: 'Redirecting...',
						text: 'Taking you to the registration page',
						allowOutsideClick: false,
						didOpen: () => {
							Swal.showLoading();
						}
					});
					
					setTimeout(() => {
						Swal.close();
						if (ukmSlug) {
							// Redirect back to specific UKM registration page
							goto(`/registration/${ukmSlug}`);
						} else if (redirectUrl) {
							// Use custom redirect URL if provided
							goto(redirectUrl);
						} else {
							// Default redirect to general registration page
							goto('/registration');
						}
					}, 1000);
				}
			} else {
				await Swal.fire({
					icon: 'error',
					title: 'Save Failed',
					text: result.message
				});
				error = result.message;
			}
		} catch (e) {
			console.error('Error saving biodata:', e);
			const errorMessage = 'Failed to save biodata. Please try again.';
			
			await Swal.fire({
				icon: 'error',
				title: 'Save Failed',
				text: errorMessage
			});
			
			error = errorMessage;
		} finally {
			loading = false;
		}
	};

	const toggleEditMode = () => {
		isEditMode = !isEditMode;
		error = '';
		success = '';
		
		// Reset validation errors when entering edit mode
		if (isEditMode) {
			formErrors = {
				line_id: '',
				phone: ''
			};
		}
	};

	const handleGoToRegistration = async () => {
		if (ukmSlug) {
			// This is "Go to Payment" - check slot availability first
			Swal.fire({
				title: 'Checking availability...',
				text: 'Please wait while we check if slots are available',
				allowOutsideClick: false,
				didOpen: () => {
					Swal.showLoading();
				}
			});

			try {
				// First, get the UKM ID from the slug
				const ukms = await get('/api/ukms');
				const targetUkm = ukms.find((u: any) => u.slug === ukmSlug);
				
				if (!targetUkm) {
					Swal.close();
					await Swal.fire({
						icon: 'error',
						title: 'UKM Not Found',
						text: 'The selected UKM could not be found.'
					});
					return;
				}

				// Call the access payment endpoint to check race condition
				const response = await post(`/api/registrations/access-payment/${targetUkm.id}`, {});
				
				Swal.close();
				
				if (response.success) {
					// Slot available - redirect to payment page with reservation info
					await Swal.fire({
						icon: 'success',
						title: 'Slot Reserved!',
						text: `Slot successfully reserved for ${targetUkm.name}. You have 5 minutes to complete payment.`,
						confirmButtonText: 'Continue to Payment'
					});
					
					// Pass reservation info as URL parameters
					const reservationData = encodeURIComponent(JSON.stringify({
						reservation_id: response.reservation_id,
						expires_at: response.expires_at,
						current_slot: response.current_slot,
						max_slot: response.max_slot
					}));
					
					goto(`/registration/${ukmSlug}?reservation=${reservationData}`);
				} else {
					// Should not reach here if API is working correctly
					await Swal.fire({
						icon: 'error',
						title: 'Access Denied',
						text: response.message || 'Unable to access payment page'
					});
				}
			} catch (error: any) {
				Swal.close();
				
				// Parse error message
				let errorMessage = 'Unable to access payment page. Please try again.';
				if (error.message && error.message.includes('No slots available')) {
					errorMessage = 'Sorry, all slots for this UKM have been taken or are currently reserved by other users.';
				} else if (error.message && error.message.includes('user has already registered for this UKM')) {
					errorMessage = 'You have already registered for this UKM. Each person can only register once per UKM.';
				}
				
				await Swal.fire({
					icon: 'error',
					title: 'Registration Full',
					text: errorMessage
				});
			}
		} else {
			// This is "Go to Registration" - normal flow
			Swal.fire({
				title: 'Redirecting...',
				text: 'Taking you to registration',
				allowOutsideClick: false,
				didOpen: () => {
					Swal.showLoading();
				}
			});
			
			setTimeout(() => {
				Swal.close();
				const targetUrl = redirectUrl || '/registration';
				goto(targetUrl);
			}, 1000);
		}
	};

	const cancelEdit = () => {
		isEditMode = false;
		error = '';
		success = '';
		
		// Reset form errors
		formErrors = {
			line_id: '',
			phone: ''
		};
	};

	const handleReset = () => {
		formData.line_id = '';
		formData.phone = '';
		formErrors = {
			line_id: '',
			phone: ''
		};
		error = '';
		success = '';
	};
</script>

<svelte:head>
	<title>Biodata Form - Open House 2025</title>
</svelte:head>

<div class="biodata-form-container">
	<div class="form-header">
		<h1>Biodata Form</h1>
		<p class="form-description">Please fill in your biodata information</p>
	</div>

	{#if loading && !formData.name}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading your information...</p>
		</div>
	{:else if error && !formData.name}
		<div class="error-container">
			<div class="error-message">
				<h3>Authentication Required</h3>
				<p>{error}</p>
				<a href="/login" class="login-link">Go to Login</a>
			</div>
		</div>
	{:else}
		{#if hasExistingData && !isEditMode}
			<!-- View Mode - Show existing data -->
			<div class="biodata-view">
				{#if error}
					<div class="alert alert-error">
						{error}
					</div>
				{/if}

				{#if success}
					<div class="alert alert-success">
						{success}
					</div>
				{/if}

				<div class="view-section">
					<h3>Your Biodata Information</h3>
					<p class="section-description">Your current biodata details</p>
					
					<div class="info-display">
						<div class="info-field">
							<label>Full Name:</label>
							<span>{formData.name}</span>
						</div>
						<div class="info-field">
							<label>NRP (Student ID):</label>
							<span>{formData.nrp}</span>
						</div>
						<div class="info-field">
							<label>Line ID:</label>
							<span>{formData.line_id}</span>
						</div>
						<div class="info-field">
							<label>Phone Number:</label>
							<span>{formData.phone}</span>
						</div>
					</div>

					<div class="view-actions">
						<button
							type="button"
							on:click={toggleEditMode}
							class="btn btn-primary"
						>
							Edit Information
						</button>
						<button 
							type="button"
							on:click={handleGoToRegistration}
							class="btn btn-secondary"
						>
							{ukmSlug ? 'Go to Payment' : 'Go to Registration'}
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Edit Mode - Show form -->
			<form on:submit|preventDefault={handleSubmit} class="biodata-form">
				{#if error}
					<div class="alert alert-error">
						{error}
					</div>
				{/if}

				{#if success}
					<div class="alert alert-success">
						{success}
					</div>
				{/if}

				<!-- Hidden/Readonly fields from session -->
				<div class="form-section">
					<h3>Account Information</h3>
					<p class="section-description">This information is from your authenticated session</p>
					
					<div class="form-group">
						<label for="name">Full Name</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							readonly
							class="readonly-field"
							title="This field is automatically filled from your session"
						/>
						<small class="field-hint">Automatically filled from your Google account</small>
					</div>

					<div class="form-group">
						<label for="nrp">NRP (Student ID)</label>
						<input
							type="text"
							id="nrp"
							value={formData.nrp}
							readonly
							class="readonly-field"
							title="This field is automatically filled from your session"
						/>
						<small class="field-hint">Automatically filled from your session</small>
					</div>
				</div>

				<!-- Editable fields -->
				<div class="form-section">
					<h3>Contact Information</h3>
					<p class="section-description">Please provide your contact details</p>

					<div class="form-group">
						<label for="line_id">
							Line ID <span class="required">*</span>
						</label>
						<input
							type="text"
							id="line_id"
							bind:value={formData.line_id}
							placeholder="Enter your Line ID"
							class:error={formErrors.line_id}
							required
						/>
						{#if formErrors.line_id}
							<small class="error-text">{formErrors.line_id}</small>
						{:else}
							<small class="field-hint">Your Line messaging app username</small>
						{/if}
					</div>

					<div class="form-group">
						<label for="phone">
							Phone Number <span class="required">*</span>
						</label>
						<input
							type="tel"
							id="phone"
							bind:value={formData.phone}
							placeholder="Enter your phone number"
							class:error={formErrors.phone}
							required
						/>
						{#if formErrors.phone}
							<small class="error-text">{formErrors.phone}</small>
						{:else}
							<small class="field-hint">Include country code if international (e.g., +62)</small>
						{/if}
					</div>
				</div>

				<!-- Form actions -->
				<div class="form-actions">
					{#if hasExistingData}
						<button
							type="button"
							on:click={cancelEdit}
							class="btn btn-secondary"
							disabled={loading}
						>
							Cancel
						</button>
					{:else}
						<button
							type="button"
							on:click={handleReset}
							class="btn btn-secondary"
							disabled={loading}
						>
							Reset Form
						</button>
					{/if}
					<button
						type="submit"
						class="btn btn-primary"
						disabled={loading}
					>
						{#if loading}
							<span class="spinner-small"></span>
							Saving...
						{:else}
							{hasExistingData ? 'Update Biodata' : 'Save Biodata'}
						{/if}
					</button>
				</div>
			</form>
		{/if}
	{/if}
</div>

<style>
	.biodata-form-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.form-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.form-header h1 {
		color: #1976d2;
		margin-bottom: 0.5rem;
		font-size: 2rem;
		font-weight: 600;
	}

	.form-description {
		color: #666;
		font-size: 1.1rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #1976d2;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	.spinner-small {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-container {
		text-align: center;
		padding: 3rem;
	}

	.error-message h3 {
		color: #d32f2f;
		margin-bottom: 1rem;
	}

	.login-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: #1976d2;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		transition: background 0.3s;
	}

	.login-link:hover {
		background: #1565c0;
	}

	/* View Mode Styles */
	.biodata-view {
		max-width: 600px;
		margin: 0 auto;
	}

	.view-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #fafafa;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.view-section h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.3rem;
	}

	.info-display {
		margin: 1.5rem 0;
	}

	.info-field {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid #eee;
	}

	.info-field:last-child {
		border-bottom: none;
	}

	.info-field label {
		font-weight: 600;
		color: #333;
		min-width: 120px;
	}

	.info-field span {
		color: #666;
		flex: 1;
		text-align: right;
		font-weight: 500;
	}

	.view-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px solid #f0f0f0;
	}

	/* Form Mode Styles */
	.biodata-form {
		max-width: 600px;
		margin: 0 auto;
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.alert-error {
		background: #ffebee;
		color: #c62828;
		border: 1px solid #ef5350;
	}

	.alert-success {
		background: #e8f5e8;
		color: #2e7d32;
		border: 1px solid #66bb6a;
	}

	.form-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #fafafa;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.form-section h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.3rem;
	}

	.section-description {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
		font-size: 1rem;
	}

	.required {
		color: #d32f2f;
	}

	.form-group input {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.3s, box-shadow 0.3s;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #1976d2;
		box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
	}

	.form-group input.error {
		border-color: #d32f2f;
		box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
	}

	.readonly-field {
		background: #f8f8f8 !important;
		color: #666 !important;
		cursor: not-allowed;
	}

	.field-hint {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.875rem;
	}

	.error-text {
		display: block;
		margin-top: 0.25rem;
		color: #d32f2f;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px solid #f0f0f0;
	}

	.btn {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #1976d2;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1565c0;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #333;
		border: 2px solid #ddd;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #eeeeee;
		border-color: #bbb;
	}

	@media (max-width: 768px) {
		.biodata-form-container {
			margin: 1rem;
			padding: 1.5rem;
		}

		.form-actions, .view-actions {
			flex-direction: column;
		}

		.form-header h1 {
			font-size: 1.5rem;
		}

		.info-field {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.info-field span {
			text-align: left;
		}
	}

	.biodata-form-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.form-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #f0f0f0;
	}

	.form-header h1 {
		color: #1976d2;
		margin-bottom: 0.5rem;
		font-size: 2rem;
		font-weight: 600;
	}

	.form-description {
		color: #666;
		font-size: 1.1rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #1976d2;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	.spinner-small {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.error-container {
		text-align: center;
		padding: 3rem;
	}

	.error-message h3 {
		color: #d32f2f;
		margin-bottom: 1rem;
	}

	.login-link {
		display: inline-block;
		margin-top: 1rem;
		padding: 0.75rem 1.5rem;
		background: #1976d2;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		transition: background 0.3s;
	}

	.login-link:hover {
		background: #1565c0;
	}

	.biodata-form {
		max-width: 600px;
		margin: 0 auto;
	}

	.alert {
		padding: 1rem;
		border-radius: 6px;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.alert-error {
		background: #ffebee;
		color: #c62828;
		border: 1px solid #ef5350;
	}

	.alert-success {
		background: #e8f5e8;
		color: #2e7d32;
		border: 1px solid #66bb6a;
	}

	.form-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #fafafa;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
	}

	.form-section h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 1.3rem;
	}

	.section-description {
		color: #666;
		margin-bottom: 1.5rem;
		font-size: 0.95rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
		font-size: 1rem;
	}

	.required {
		color: #d32f2f;
	}

	.form-group input {
		width: 100%;
		padding: 0.875rem;
		border: 2px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.3s, box-shadow 0.3s;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #1976d2;
		box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
	}

	.form-group input.error {
		border-color: #d32f2f;
		box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
	}

	.readonly-field {
		background: #f8f8f8 !important;
		color: #666 !important;
		cursor: not-allowed;
	}

	.field-hint {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.875rem;
	}

	.error-text {
		display: block;
		margin-top: 0.25rem;
		color: #d32f2f;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 2px solid #f0f0f0;
	}

	.btn {
		flex: 1;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #1976d2;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #1565c0;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
	}

	.btn-secondary {
		background: #f5f5f5;
		color: #333;
		border: 2px solid #ddd;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #eeeeee;
		border-color: #bbb;
	}

	@media (max-width: 768px) {
		.biodata-form-container {
			margin: 1rem;
			padding: 1.5rem;
		}

		.form-actions {
			flex-direction: column;
		}

		.form-header h1 {
			font-size: 1.5rem;
		}
	}
</style>
