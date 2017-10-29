(async () => {
  const app = new Vue({
    el: '#app',
    data: {
      email: '',
      username: '',
    },
  });

  const res = await fetch('/api/profile', {
    // Send cookies along so we don't get a "not logged in" error
    credentials: 'include',
  });
  const json = await res.json();
  if (!json.success) {
    window.location.replace('/');
  }

  const { email, username } = json.data;
  app.email = email;
  app.username = username;

})();
