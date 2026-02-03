// 1. Iniciar uibuilder
uibuilder.start()

// 2. Definir la App de Vue
new Vue({
    el: '#app',
    data: {
        // Variables de datos
        temperatura: 0,      // Valor numérico
        motorActivo: false,  // Booleano (true/false)
        
        // Variables visuales (no tocar manualmente)
        anguloAguja: 0,
        arcoLlenado: 0
    },
    computed: {
        // Calculamos el color de la barra según la temperatura
        colorGauge: function() {
            if (this.temperatura < 60) return '#28a745'; // Verde (OK)
            if (this.temperatura < 85) return '#ffc107'; // Amarillo (Warn)
            return '#dc3545'; // Rojo (Danger)
        }
    },
    methods: {
        // Función para mover la aguja visualmente
        actualizarGauge: function(valor) {
            // 1. Limitar el valor entre 0 y 100 para que la aguja no se salga
            if (valor > 100) valor = 100;
            if (valor < 0) valor = 0;

            // 2. Guardar el valor real
            this.temperatura = valor;

            // 3. Calcular ángulo (Regla de 3)
            // 0 grados es "izquierda", 180 es "derecha".
            // Convertimos 0-100 a 0-180
            this.anguloAguja = (valor / 100) * 180;

            // 4. Calcular el llenado del arco (Truco SVG)
            // El arco completo mide aprox 251 pixeles (Pi * Radio)
            const longitudArco = 251; 
            this.arcoLlenado = (valor / 100) * longitudArco;
        },

        alternarMotor: function() {
            // Cambiamos el estado localmente
            this.motorActivo = !this.motorActivo;
            
            // Enviamos el aviso a Node-RED
            uibuilder.send({
                topic: "comando_motor",
                payload: this.motorActivo
            });
        }
    },
    mounted: function() {
        console.log("HMI Cargada con Gauge y LED");

        // Escuchar mensajes de Node-RED
        uibuilder.onChange('msg', (newMsg) => {
            
            // Si el mensaje es sobre el sensor (como definimos en Node-RED)
            if (newMsg.topic === "sensor_temp") {
                // Asumimos que el payload es texto "Temperatura: 34.5 °C"
                // Ojo: Si ya lo mandas limpio desde Node-RED es mejor.
                // Aquí vamos a extraer solo el número usando Regex o split
                // TRUCO: Modifiquemos Node-RED para mandar SOLO el número en el paso siguiente
                // Pero por si acaso, intentamos leer el numero directo:
                var numero = parseFloat(newMsg.payload); 
                
                // Si logramos sacar un numero, actualizamos
                if (!isNaN(numero)) {
                    this.actualizarGauge(numero);
                }
            }
        })
    }
})