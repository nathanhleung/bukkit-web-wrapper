/* eslint-env browser */
/* global Vue */

(async () => {
  const app = new Vue({
    el: "#admin-app",
    data: {
      command: "",
      logs: ""
    },
    created() {
      this.refreshLogs();
    },
    methods: {
      async refreshLogs() {
        const res = await fetch("/api/logs", {
          credentials: "include"
        });
        const json = await res.json();
        const { data } = json;
        this.logs = data;
      },
      async runCommand() {
        const { command } = this;
        // Clear form
        this.command = "";
        await fetch("/api/command", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            command
          })
        });
        this.refreshLogs();
      }
    }
  });
})();
