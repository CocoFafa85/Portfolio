// Test pour vérifier si jQuery est chargé
if (typeof jQuery === 'undefined') {
    console.log('jQuery n\'est pas chargé');
} else {
    console.log('jQuery est chargé');
}

// Exécuter quand le DOM est prêt
$(document).ready(function(){
    $('.fly-in-text li').each(function(index){
        const el = $(this);
        setTimeout(() => {
            el.removeClass('hidden');
        }, 100 * index); // décalage de 100ms par lettre
    });
});

