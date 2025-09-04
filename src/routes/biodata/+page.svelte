<script lang="ts">
	import { onMount } from 'svelte';
	import { getCurrentUserInfo, getUserBiodata, updateUserBiodata, get, post, reserveSlot } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Swal from "sweetalert2";
	import CarnivalTable from '$lib/components/background/CarnivalTable.svelte';

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
					
					setTimeout(async () => {
						Swal.close();
						if (ukmSlug) {
							try {
								// Get UKM data to find the ID
								const ukms = await get('/api/ukms') as any[];
								const ukm = ukms.find((u: any) => u.slug === ukmSlug);
								
								if (ukm) {
									// Show reservation loading
									Swal.fire({
										title: 'Reserving Slot...',
										text: 'Please wait while we reserve your slot',
										allowOutsideClick: false,
										didOpen: () => {
											Swal.showLoading();
										}
									});
									
									// Reserve a slot
									const reservation = await reserveSlot(ukm.id);
									
									Swal.close();
									
									// Redirect to registration page with reservation data
									const reservationParam = encodeURIComponent(JSON.stringify(reservation));
									goto(`/registration/${ukmSlug}?reservation=${reservationParam}`);
								} else {
									// UKM not found, redirect without reservation
									goto(`/registration/${ukmSlug}`);
								}
							} catch (e) {
								console.error('Error reserving slot:', e);
								await Swal.fire({
									icon: 'error',
									title: 'Slot Reservation Failed',
									text: 'Could not reserve a slot. You can still try to register.',
									confirmButtonText: 'Continue'
								});
								// Redirect anyway
								goto(`/registration/${ukmSlug}`);
							}
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
				const ukms = await get('/api/ukms') as any[];
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
				const response = await post(`/api/registrations/access-payment/${targetUkm.id}`, {}) as any;
				
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

<CarnivalTable class="min-h-screen">
	<div class="container mx-auto px-4 py-8">
		<div class="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-yellow-400 overflow-hidden">
		<!-- Carnival header -->
		<div class="bg-gradient-to-r from-red-500 via-yellow-500 to-pink-500 p-6 text-center relative">
			<div class="absolute inset-0 bg-white/10"></div>
			<h1 class="relative text-4xl font-bold text-white drop-shadow-lg mb-2">
				🎪 Biodata Carnival 🎪
			</h1>
			<p class="relative text-white/90 text-lg font-medium">
				🎊 Complete your magical profile for the grand adventure! 🌟
			</p>
		</div>

		<!-- Main content -->
			<div class="p-8">
				{#if loading && !formData.name}
					<div class="text-center py-12">
						<div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
						<p class="text-purple-700 text-lg font-medium">🎠 Loading your magical information... ✨</p>
					</div>
				{:else if error && !formData.name}
					<div class="text-center py-12">
						<div class="bg-red-100 border-3 border-red-400 rounded-2xl p-8 max-w-md mx-auto">
							<div class="text-6xl mb-4">🚫</div>
							<h3 class="text-2xl font-bold text-red-700 mb-3">Authentication Required</h3>
							<p class="text-red-600 mb-6">{error}</p>
							<a href="/login" class="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200">
								🔐 Go to Login
							</a>
						</div>
					</div>
				{:else}
					{#if hasExistingData && !isEditMode}
						<!-- View Mode - Show existing data -->
						<div class="carnival-view-mode">
							{#if error}
								<div class="bg-red-100 border-3 border-red-400 rounded-2xl p-4 mb-6 text-center">
									<div class="text-3xl mb-2">❌</div>
									<p class="text-red-700 font-medium">{error}</p>
								</div>
							{/if}

							{#if success}
								<div class="bg-green-100 border-3 border-green-400 rounded-2xl p-4 mb-6 text-center">
									<div class="text-3xl mb-2">✅</div>
									<p class="text-green-700 font-medium">{success}</p>
								</div>
							{/if}

							<!-- Biodata display card -->
							<div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-8 border-3 border-purple-400 mb-8">
								<div class="text-center mb-6">
									<h3 class="text-3xl font-bold text-purple-700 mb-2">🎪 Your Carnival Profile 🎪</h3>
									<p class="text-purple-600 text-lg">Your magical details are ready for the adventure!</p>
								</div>
								
								<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div class="bg-white/80 rounded-2xl p-6 border-2 border-yellow-300">
										<div class="flex items-center mb-3">
											<span class="text-2xl mr-3">👤</span>
											<div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Full Name</div>
										</div>
										<span class="text-xl font-semibold text-gray-800">{formData.name}</span>
									</div>
									
									<div class="bg-white/80 rounded-2xl p-6 border-2 border-blue-300">
										<div class="flex items-center mb-3">
											<span class="text-2xl mr-3">🎓</span>
											<div class="text-sm font-bold text-gray-600 uppercase tracking-wide">NRP (Student ID)</div>
										</div>
										<span class="text-xl font-semibold text-gray-800">{formData.nrp}</span>
									</div>
									
									<div class="bg-white/80 rounded-2xl p-6 border-2 border-green-300">
										<div class="flex items-center mb-3">
											<span class="text-2xl mr-3">💬</span>
											<div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Line ID</div>
										</div>
										<span class="text-xl font-semibold text-gray-800">{formData.line_id}</span>
									</div>
									
									<div class="bg-white/80 rounded-2xl p-6 border-2 border-pink-300">
										<div class="flex items-center mb-3">
											<span class="text-2xl mr-3">📱</span>
											<div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Phone Number</div>
										</div>
										<span class="text-xl font-semibold text-gray-800">{formData.phone}</span>
									</div>
								</div>
							</div>

							<!-- Action buttons -->
							<div class="flex flex-col sm:flex-row gap-4 justify-center">
								<button
									type="button"
									on:click={toggleEditMode}
									class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
								>
									<span class="mr-2">✏️</span>
									Edit Information
								</button>
								<button 
									type="button"
									on:click={handleGoToRegistration}
									class="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
								>
									<span class="mr-2">{ukmSlug ? '💳' : '🎪'}</span>
									{ukmSlug ? 'Go to Payment' : 'Go to Registration'}
								</button>
							</div>
						</div>
					{:else}
						<!-- Edit Mode - Show form -->
						<div class="carnival-edit-mode">
							{#if error}
								<div class="bg-red-100 border-3 border-red-400 rounded-2xl p-4 mb-6 text-center">
									<div class="text-3xl mb-2">❌</div>
									<p class="text-red-700 font-medium">{error}</p>
								</div>
							{/if}

							{#if success}
								<div class="bg-green-100 border-3 border-green-400 rounded-2xl p-4 mb-6 text-center">
									<div class="text-3xl mb-2">🎉</div>
									<p class="text-green-700 font-medium">{success}</p>
								</div>
							{/if}

							<form on:submit|preventDefault={handleSubmit} class="space-y-8">
								<!-- Account Information Section -->
								<div class="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 border-3 border-blue-400">
									<div class="text-center mb-6">
										<h3 class="text-2xl font-bold text-blue-700 mb-2">🎫 Account Information 🎫</h3>
										<p class="text-blue-600">This information is from your authenticated session</p>
									</div>
									
									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div class="form-group">
											<label for="name" class="text-sm font-bold text-blue-700 mb-2 flex items-center">
												<span class="mr-2">👤</span>
												Full Name
											</label>
											<input
												type="text"
												id="name"
												value={formData.name}
												readonly
												class="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 bg-gray-100 text-gray-700 font-medium"
												title="This field is automatically filled from your session"
											/>
											<small class="text-blue-600 text-sm mt-1 block">✨ Automatically filled from your Google account</small>
										</div>

										<div class="form-group">
											<label for="nrp" class="text-sm font-bold text-blue-700 mb-2 flex items-center">
												<span class="mr-2">🎓</span>
												NRP (Student ID)
											</label>
											<input
												type="text"
												id="nrp"
												value={formData.nrp}
												readonly
												class="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 bg-gray-100 text-gray-700 font-medium"
												title="This field is automatically filled from your session"
											/>
											<small class="text-blue-600 text-sm mt-1 block">✨ Automatically filled from your session</small>
										</div>
									</div>
								</div>

								<!-- Contact Information Section -->
								<div class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-8 border-3 border-purple-400">
									<div class="text-center mb-6">
										<h3 class="text-2xl font-bold text-purple-700 mb-2">📞 Contact Information 📞</h3>
										<p class="text-purple-600">Please provide your contact details</p>
									</div>

									<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div class="form-group">
											<label for="line_id" class="text-sm font-bold text-purple-700 mb-2 flex items-center">
												<span class="mr-2">💬</span>
												Line ID
												<span class="text-red-500 ml-1">*</span>
											</label>
											<input
												type="text"
												id="line_id"
												bind:value={formData.line_id}
												placeholder="Enter your Line ID"
												class="w-full px-4 py-3 rounded-2xl border-2 {formErrors.line_id ? 'border-red-400 bg-red-50' : 'border-purple-300 bg-white'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
												required
											/>
											{#if formErrors.line_id}
												<small class="text-red-600 text-sm mt-1 block">{formErrors.line_id}</small>
											{:else}
												<small class="text-purple-600 text-sm mt-1 block">📱 Your Line messaging app username</small>
											{/if}
										</div>

										<div class="form-group">
											<label for="phone" class="text-sm font-bold text-purple-700 mb-2 flex items-center">
												<span class="mr-2">📱</span>
												Phone Number
												<span class="text-red-500 ml-1">*</span>
											</label>
											<input
												type="tel"
												id="phone"
												bind:value={formData.phone}
												placeholder="Enter your phone number"
												class="w-full px-4 py-3 rounded-2xl border-2 {formErrors.phone ? 'border-red-400 bg-red-50' : 'border-purple-300 bg-white'} focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
												required
											/>
											{#if formErrors.phone}
												<small class="text-red-600 text-sm mt-1 block">{formErrors.phone}</small>
											{:else}
												<small class="text-purple-600 text-sm mt-1 block">🌍 Include country code if international (e.g., +62)</small>
											{/if}
										</div>
									</div>
								</div>

								<!-- Form actions -->
								<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
									{#if hasExistingData}
										<button
											type="button"
											on:click={cancelEdit}
											class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
											disabled={loading}
										>
											<span class="mr-2">❌</span>
											Cancel
										</button>
									{:else}
										<button
											type="button"
											on:click={handleReset}
											class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
											disabled={loading}
										>
											<span class="mr-2">🔄</span>
											Reset Form
										</button>
									{/if}
									<button
										type="submit"
										class="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
										disabled={loading}
									>
										{#if loading}
											<div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
											Saving...
										{:else}
											<span class="mr-2">💾</span>
											{hasExistingData ? 'Update Biodata' : 'Save Biodata'}
										{/if}
									</button>
								</div>
							</form>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</CarnivalTable>

<style>
	.container {
		max-width: 1200px;
	}
	
	/* Carnival theme enhancements */
	.border-3 {
		border-width: 3px;
	}
	
	/* Form group spacing */
	.form-group {
		margin-bottom: 1rem;
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
	}
</style>
