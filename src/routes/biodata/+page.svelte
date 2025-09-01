<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentUserInfo, getUserBiodata, updateUserBiodata } from '$lib/api';

	let loading = true;
	let error = '';
	let success = '';
	
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
				if (existingBiodata) {
					formData.line_id = existingBiodata.line_id || '';
					formData.phone = existingBiodata.phone || '';
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

			// Call API to save biodata
			const result = await updateUserBiodata(formData.line_id, formData.phone);
			
			if (result.success) {
				success = result.message;
			} else {
				error = result.message;
			}
		} catch (e) {
			console.error('Error saving biodata:', e);
			error = 'Failed to save biodata. Please try again.';
		} finally {
			loading = false;
		}
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
				<button
					type="button"
					on:click={handleReset}
					class="btn btn-secondary"
					disabled={loading}
				>
					Reset Form
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={loading}
				>
					{#if loading}
						<span class="spinner-small"></span>
						Saving...
					{:else}
						Save Biodata
					{/if}
				</button>
			</div>
		</form>
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
