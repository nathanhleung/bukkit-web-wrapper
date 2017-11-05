/* eslint-env browser */
/* global Vue _ moment fetch CoinHive */

(async () => {
  let miner;
  let originalBalance = -1;
  const app = new Vue({
    el: "#app",
    created() {
      this.getUserData();
      this.getEarnedBalance();
    },
    data: {
      id: "",
      email: "",
      username: "",
      userData: {},
      isMining: false,
      minerData: {
        hashRate: 0,
        acceptedHashes: 0,
        totalHashes: 0
      },
      hashBalance: 0,
      transferring: false,
      error: ""
    },
    computed: {
      lastLogin() {
        const lastLoginTimestamp = _.get(
          this.userData,
          "timestamps.login",
          // Return right now as default
          new Date().getTime()
        );
        return moment(lastLoginTimestamp).fromNow();
      },
      money() {
        const userMoney = _.get(this.userData, "money", 0);
        return userMoney;
      }
    },
    methods: {
      toggleMining() {
        let interval;
        if (!this.isMining) {
          miner.start();
          this.isMining = true;
          interval = setInterval(() => {
            this.minerData = {
              hashrate: Math.round(miner.getHashesPerSecond()),
              // this will include all lifetime hashes
              acceptedHashes: Math.round(miner.getAcceptedHashes()),
              totalHashes: Math.round(miner.getTotalHashes(true))
            };
          }, 250);
        } else {
          miner.stop();
          this.isMining = false;
          this.minerData = {
            hashrate: 0,
            acceptedHashes: 0,
            totalHashes: 0
          };
          this.getEarnedBalance();
          clearInterval(interval);
        }
      },
      async getUserData() {
        const res = await fetch("/api/user", {
          credentials: "include"
        });
        const json = await res.json();
        this.userData = json.data;
      },
      async getEarnedBalance() {
        const res = await fetch("/api/user-hash-balance", {
          credentials: "include"
        });
        const json = await res.json();
        this.hashBalance = json.balance;
        if (originalBalance === -1) {
          originalBalance = json.balance;
        }
      },
      async transferEarnedBalance() {
        this.transferring = true;
        const data = {
          // @todo
          // This should not be client-side
          // Endgame is automatic transfers
          amount: this.hashBalance
        };
        const res = await fetch("/api/user-hash-withdraw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
          this.transferring = false;
          // Update in-game money
          this.getUserData();
          this.getEarnedBalance();
        } else {
          this.transferring = false;
          this.error = "An error occurred.";
        }
      }
    }
  });

  const res = await fetch("/api/profile", {
    // Send cookies along so we don't get a "not logged in" error
    credentials: "include"
  });
  const json = await res.json();
  if (!json.success) {
    window.location.replace("/");
  }
  const { id, email, username } = json.data;
  app.id = id;
  app.email = email;
  app.username = username;

  // Initialize miner once user ID is available
  miner = new CoinHive.User("P17PsORp5ZyjfEX9Gy1Zcmpoh13ixmQd", app.id);
})();
