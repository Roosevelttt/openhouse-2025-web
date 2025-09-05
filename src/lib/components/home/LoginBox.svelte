<div class="login-container">
  <h2 class="title">Login</h2>
  <form on:submit|preventDefault class="space-y-4">
    <div>
      <label for="username" class="label">Username</label>
      <input type="text" id="username" name="username" class="input" />
    </div>
    <div>
      <label for="password" class="label">Password</label>
      <input type="password" id="password" name="password" class="input" />
    </div>
    <button type="submit" class="button">
      Login
    </button>
  </form>
</div>

<style>
  .login-container {
    background-color: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 380px;
    border: 1px solid #e2e8f0;
  }
  .title {
    text-align: center;
    font-size: 1.75rem;
    font-weight: bold;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }
  .label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }
  .input {
    display: block;
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.375rem;
  }
  .input:focus {
    outline: 2px solid #8b5cf6;
    outline-offset: 2px;
    border-color: transparent;
  }
  .button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 0.375rem;
    background-color: #8b5cf6;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .button:hover {
    background-color: #7c3aed;
  }
</style>