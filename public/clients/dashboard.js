$(function () {
    let socket = io();

    const demandeBtn = document.getElementById("demandeBtn");
    const desactiverAlarmeBtn = document.getElementById("desactiverAlarmeBtn");

    if (demandeBtn && desactiverAlarmeBtn) {
        demandeBtn.addEventListener('click', () => {
            console.log("demandeBtn");
            const data = ["0", "1", "1"];
            socket.emit('ask-for-video', data);
        });

        desactiverAlarmeBtn.addEventListener('click', () => {
            console.log("desactiverAlarmeBtn");
            const data = ["1", "1", "0"];
            socket.emit('desactivate-alarm', data);
        });
    }
});
