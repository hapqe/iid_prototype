<script>
  export let messages = [];
  export let typedMessage = "";
</script>

<div class="chat-screen">
  <div class="keyboard-status-hint text-center">
    Close Keyboard to close chat
  </div>

  <div class="chat-log-container">
    <div class="chat-log">
      {#each messages as msg}
        <div class="chat-message">
          <span class="chat-author">{msg.author}:</span>
          <span class="chat-text">{msg.text}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="input-line-container">
    <div class="typing-indicator">
      {#if typedMessage.length === 0}
        <span class="placeholder">Type a message...</span>
      {:else}
        {typedMessage}
      {/if}
      <span class="cursor">|</span>
    </div>
  </div>
</div>

<style>
  .chat-screen {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex-grow: 1;
    color: #ffffff;
    font-family: sans-serif;
    overflow: hidden;
  }

  .keyboard-status-hint {
    font-size: 16px; /* Reduced from 24px */
    color: #ffffff;
    margin-top: 10px;
    margin-bottom: 10px; /* Reduced from 20px */
    flex-shrink: 0;
  }

  .chat-log-container {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 15px; /* Reduced from 20px */
  }

  .chat-log {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Reduced from 20px */
  }

  .chat-message {
    font-size: 16px; /* Reduced from 26px */
    line-height: 1.4;
  }

  .chat-author {
    font-weight: 700;
    margin-right: 8px;
  }

  .input-line-container {
    background-color: #ffffff;
    padding: 10px 15px; /* Reduced from 16px 24px */
    margin-left: -15px;
    margin-right: -15px; /* Updated negative margin constraint */
    flex-shrink: 0;
  }

  .typing-indicator {
    color: #000000;
    font-size: 16px; /* Reduced from 26px */
    font-weight: 700;
  }

  .placeholder {
    color: #888888;
    font-weight: 400;
    font-style: italic;
  }

  .cursor {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
</style>