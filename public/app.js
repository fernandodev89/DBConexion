document.getElementById("btn").addEventListener("click", async () => {
   const nombre = document.getElementById("nombre").value;
   await fetch("/crear", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ nombre })
   });
   alert("Dato agregado");
});