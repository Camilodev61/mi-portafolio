document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Iconos para los temas
    const sunIcon = '☀️'; // Sol para modo claro
    const moonIcon = '🌙'; // Luna para modo oscuro

    // Función para aplicar el tema y actualizar el ícono
    const applyTheme = (isDarkMode) => {
        if (isDarkMode) {
            body.classList.add('dark-mode');
            themeIcon.textContent = sunIcon; // En modo oscuro, muestra el sol (para cambiar a claro)
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeIcon.textContent = moonIcon; // En modo claro, muestra la luna (para cambiar a oscuro)
            localStorage.setItem('theme', 'light');
        }
    };

    // Comprobar el tema guardado al cargar la página
    const savedTheme = localStorage.getItem('theme');
    // Comprobar también la preferencia del sistema si no hay nada guardado
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark') {
        applyTheme(true);
    } else if (savedTheme === 'light') {
        applyTheme(false);
    } else if (prefersDarkScheme) {
        // Si no hay tema guardado, pero el sistema prefiere oscuro, aplicar modo oscuro
        applyTheme(true);
    } else {
        // Por defecto (o si el sistema prefiere claro y no hay nada guardado), aplicar modo claro
        applyTheme(false);
    }


    // Event listener para el botón
    themeToggleButton.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        applyTheme(!isDarkMode); // Alternar el tema actual
    });

    // (Opcional) Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Solo cambiar si no hay una preferencia explícita del usuario guardada
        if (!localStorage.getItem('theme')) {
            applyTheme(event.matches);
        }
    });

    // Función para hacer los SVGs arrastrables
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const hoverSound = document.getElementById('hover-sound');
        let isDragging = false;
        
        // Función para reproducir el sonido
        function playHoverSound() {
            hoverSound.currentTime = 0; // Reiniciar el sonido
            hoverSound.play().catch(error => console.log('Error al reproducir el sonido:', error));
        }

        // Función para detener el sonido
        function stopHoverSound() {
            hoverSound.pause();
            hoverSound.currentTime = 0;
        }

        // Eventos de mouse para el sonido
        element.addEventListener('mouseenter', () => {
            if (!isDragging) {
                playHoverSound();
            }
        });

        element.addEventListener('mouseleave', () => {
            if (!isDragging) {
                stopHoverSound();
            }
        });
        
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            isDragging = true;
            playHoverSound();
            // Obtener la posición inicial del cursor
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            // Calcular la nueva posición
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Establecer la nueva posición del elemento
            const heroSection = document.getElementById('hero');
            const rect = heroSection.getBoundingClientRect();
            
            // Calcular la nueva posición relativa a la sección hero
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            
            // Verificar límites para mantener el SVG dentro de la sección
            if (newTop >= 0 && newTop <= rect.height - element.offsetHeight) {
                element.style.top = newTop + "px";
            }
            if (newLeft >= 0 && newLeft <= rect.width - element.offsetWidth) {
                element.style.left = newLeft + "px";
            }
        }

        function closeDragElement() {
            isDragging = false;
            stopHoverSound();
            // Detener el movimiento cuando se suelta el botón del mouse
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Hacer que todos los SVGs sean arrastrables cuando el DOM esté cargado
    const svgs = document.querySelectorAll('.floating-svg');
    svgs.forEach(svg => makeDraggable(svg));

    // Función para manejar los botones de me gusta
    function initializeLikeButtons() {
        const likeButtons = document.querySelectorAll('.btn-like');
        
        likeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const likeCount = this.querySelector('.like-count');
                const currentCount = parseInt(likeCount.textContent);
                
                if (this.classList.contains('liked')) {
                    // Si ya está dado like, quitar el like
                    this.classList.remove('liked');
                    likeCount.textContent = currentCount - 1;
                } else {
                    // Si no está dado like, agregar el like
                    this.classList.add('liked');
                    likeCount.textContent = currentCount + 1;
                    
                    // Reproducir el sonido de like
                    const hoverSound = document.getElementById('hover-sound');
                    hoverSound.currentTime = 0;
                    hoverSound.play().catch(error => console.log('Error al reproducir el sonido:', error));
                }
            });
        });
    }

    // Inicializar los botones de me gusta cuando el DOM esté cargado
    initializeLikeButtons();

    // Inicializar EmailJS con la clave pública correcta
    emailjs.init("aH-9kb1_PABHGJ2-o");

    // Manejar el envío del formulario
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Mostrar estado de carga
            formStatus.textContent = 'Enviando mensaje...';
            formStatus.className = 'form-status';
            formStatus.style.display = 'block';

            try {
                // Verificar que todos los campos existan
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const subjectInput = document.getElementById('subject');
                const messageInput = document.getElementById('message');

                if (!nameInput || !emailInput || !subjectInput || !messageInput) {
                    throw new Error('No se encontraron todos los campos del formulario');
                }

                const templateParams = {
                    from_name: nameInput.value,
                    from_email: emailInput.value,
                    subject: subjectInput.value,
                    message: messageInput.value
                };

                console.log('Configuración de EmailJS:');
                console.log('Public Key:', "aH-9kb1_PABHGJ2-o");
                console.log('Service ID:', 'service_1p0r8kd');
                console.log('Template ID:', 'template_8z83oun');
                console.log('Parámetros del formulario:', templateParams);

                const response = await emailjs.send('service_1p0r8kd', 'template_8z83oun', templateParams);
                console.log('Respuesta del servidor:', response);
                
                if (response.status === 200) {
                    formStatus.textContent = '¡Mensaje enviado con éxito!';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    throw new Error(`Error en el envío: ${response.status}`);
                }
            } catch (error) {
                console.error('Error detallado:', error);
                formStatus.textContent = `Error al enviar el mensaje: ${error.message}. Por favor, intenta de nuevo.`;
                formStatus.className = 'form-status error';
            }
        });
    }
}); 