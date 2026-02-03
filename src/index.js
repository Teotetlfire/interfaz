// 1. Iniciar uibuilder
uibuilder.start()

// 2. Definir la App de Vue
new Vue({
    el: '#app',
    data: {
        // Datos del sistema
        temperatura: 0,
        motorActivo: false,
        
        // Datos visuales del Gauge
        anguloAguja: 0,
        arcoLlenado: 0,
        
        // Variables para el mapa
        mapa: null,
        marcador: null
    },
    computed: {
        colorGauge: function() {
            if (this.temperatura < 60) return '#28a745'; // Verde
            if (this.temperatura < 85) return '#ffc107'; // Amarillo
            return '#dc3545'; // Rojo
        }
    },
    methods: {
        actualizarGauge: function(valor) {
            if (valor > 100) valor = 100;
            if (valor < 0) valor = 0;
            this.temperatura = valor;
            this.anguloAguja = (valor / 100) * 180;
            const longitudArco = 251; 
            this.arcoLlenado = (valor / 100) * longitudArco;
        },
        alternarMotor: function() {
            this.motorActivo = !this.motorActivo;
            uibuilder.send({
                topic: "comando_motor",
                payload: this.motorActivo
            });
        }
    },
    mounted: function() {
        console.log("HMI Iniciada");

        // --- INICIO LÓGICA MAPA ---
        // Coordenadas ACTUALIZADAS: Caborca, Sonora
        var lat = 30.7083;
        var lon = -112.1508;

        // Crear mapa vinculado al div 'mapaPlanta'
        // Nota: Cambié el zoom de 13 a 14 para que se vea más cerca la ciudad
        this.mapa = L.map('mapaPlanta').setView([lat, lon], 14);

        // Cargar capas de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.mapa);

        // Crear marcador
        this.marcador = L.marker([lat, lon]).addTo(this.mapa);
        this.marcador.bindPopup("<b>Planta Principal</b><br>Sistema Online").openPopup();
        
        // Corrección común: Forzar al mapa a recalcular su tamaño
        setTimeout(() => { this.mapa.invalidateSize(); }, 500);
        // --- FIN LÓGICA MAPA ---

        // Escuchar a Node-RED
        uibuilder.onChange('msg', (newMsg) => {
            if (newMsg.topic === "sensor_temp") {
                this.actualizarGauge(parseFloat(newMsg.payload));
            }
        });
    }
})