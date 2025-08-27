interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(apiUrl: string, id: number): Promise<User> {
  const response = await fetch(`${apiUrl}/users/${id}`, {
    headers: { Accept: "application/json" },
  });
  return response.json();
}

document.getElementById("fetchUser")?.addEventListener("click", async () => {
  const userDetails = document.getElementById("userDetails");
  try {
    const user = await fetchUser("http://localhost:1234", 1); // Mock provider URL
    userDetails!.innerHTML = `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`;
  } catch (error) {
    userDetails!.innerHTML = "Error fetching user";
  }
});
