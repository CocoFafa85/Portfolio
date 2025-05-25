    function getLoadingPath() {
      const currentPath = window.location.pathname;
      if (currentPath.includes('index')) {
          return 'html/loading.html';
      } else {
          return '../html/loading.html';
      }
  }
        
  document.querySelectorAll('a.page-link, a.button-back').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetHref = this.getAttribute('href');
      
      // === On vérifie si c'est un retour vers la home ===
      if (this.classList.contains('button-back')) {
        sessionStorage.setItem('skipAnimation', 'true'); 
      }


      const loadingPath = getLoadingPath();
  
      if (!loadingPath) {
        console.error('Invalid loading path.');
        return;
      }
  
      const iframe = document.createElement('iframe');
      iframe.src = loadingPath;
      iframe.style.position = 'fixed';
      iframe.style.top = 0;
      iframe.style.left = 0;
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.style.zIndex = 9999;
      document.body.appendChild(iframe);
  
      iframe.onload = () => {
        iframe.contentWindow.postMessage({ target: targetHref }, '*');
      };
  
      window.addEventListener('message', function(event) {
        if (event.origin !== window.location.origin) {
          console.error('Message from untrusted origin:', event.origin);
          return;
        }
      });
    });
  });
  
    console.log("Chargement de la transition...");
