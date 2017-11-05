/* eslint-env browser */
/* global Vue Fingerprint2 */

(async () => {
  new Fingerprint2().get((result, components) => {
    const user_agent = components[0].value;
    document.getElementById("fingerprint").value = JSON.stringify({
      hash: result,
      user_agent
    });
  });

  const app = new Vue({
    el: "#app",
    created() {
      this.getUsersOnline();
      this.getVersion();
    },
    data: {
      onlineCount: 0,
      version: "0"
    },
    methods: {
      async getUsersOnline() {
        const res = await fetch("/api/users-online");
        const json = await res.json();

        if (json.success) {
          const { onlineCount } = json;
          app.onlineCount = onlineCount;
        }
      },
      async getVersion() {
        const res = await fetch("/api/version");
        const json = await res.json();

        if (json.success) {
          const { data } = json;
          app.version = data;
        }
      }
    }
  });
})();
