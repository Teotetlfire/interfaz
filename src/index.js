// 1. Iniciar uibuilder
uibuilder.start()

// 2. Definir la App de Vue
new Vue({
    el: '#app', // Se conecta al div con id="app" del HTML
    data: {
        msg: { payload: "Esperando datos..." },
        estadoMotor: false
    },
    methods: {
        // Función para enviar datos a Node-RED
        enviarComando: function() {
            this.estadoMotor = !this.estadoMotor;
            console.log("Enviando comando...");
            
            // Enviar mensaje por WebSocket a Node-RED
            uibuilder.send({
                topic: "comando_motor",
                payload: this.estadoMotor
            });
        }
    },
    mounted: function() {
        // Esto se ejecuta cuando la página carga
        console.log("HMI Iniciada");

        // Escuchar mensajes que vienen de Node-RED
        uibuilder.onChange('msg', (newMsg) => {
            console.info("Mensaje recibido del PLC:", newMsg);
            this.msg = newMsg;
        })
    }
})