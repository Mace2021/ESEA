/* ==========================================
   ESEA - Interface text in English, Spanish and French
   The home screen and Today's Plan follow the language grown-ups choose.
   Elements with data-i18n="key" get translated text; activity links are
   translated by their page (href). Activities without content in the chosen
   language get a small "EN" tag so families know they will be in English.
   Load after family.js.
   ========================================== */
(function(global) {
  var TEXT = {
    es: {
      tagline: 'App de aprendizaje temprano',
      'welcome.title': 'Un comienzo divertido para los más pequeños',
      'welcome.text': 'Práctica sencilla para niños de 3 a 6 años: escuchar, mirar, tocar, nombrar, contar, emparejar y celebrar pequeños logros.',
      'section.foundations': 'Primeras bases',
      'section.language': 'Lenguaje y cuentos',
      'section.whole': 'Desarrollo integral',
      'card.numbers': 'Números', 'card.numbers.sub': 'Sigue los pasos: ver cantidades pequeñas, contar, comparar y ordenar números.',
      'card.abc': 'ABC y letras', 'card.abc.sub': 'Sigue los pasos: rimas, partes de palabras, primeros sonidos y luego letras (en inglés).',
      'card.colors': 'Colores', 'card.colors.sub': 'Aprende los nombres de los colores con dibujos claros y alegres.',
      'card.shapes': 'Formas', 'card.shapes.sub': 'Encuentra círculos, cuadrados, triángulos y otras formas de todos los días.',
      'card.words': 'Primeras palabras', 'card.words.sub': 'Une dibujos y palabras antes de empezar a deletrear.',
      'card.stories': 'Cuentos', 'card.stories.sub': 'Leer juntos desarrolla la atención, el vocabulario, la memoria y la alegría.',
      'card.routines': 'Rutinas diarias', 'card.routines.sub': 'Días, meses y estaciones a través de rutinas conocidas.',
      'card.feelings': 'Emociones', 'card.feelings.sub': 'Nombra emociones, descúbrelas en otros y practica a calmarte.',
      'card.nature': 'Descubrir la naturaleza', 'card.nature.sub': 'Observa plantas, animales, el tiempo y los seres vivos.',
      'card.matching': 'Juegos de parejas', 'card.matching.sub': 'Memoria, atención, turnos y emparejar imágenes.',
      'card.videos': 'Mirar y escuchar', 'card.videos.sub': 'Videos cortos para ver juntos, con un adulto.',
      'educator.title': 'Pensado para los primeros años',
      'educator.text': 'Actividades cortas y concretas, en el orden en que los niños pequeños suelen aprender. Sin anuncios, sin cuentas y sin rankings.',
      'grownups.link': '👪 Área de adultos',
      'grownups.text': 'Mira lo que ha aprendido tu hijo o hija, pon un límite de tiempo diario, añade hermanos y encuentra ideas para casa.',
      about: 'Sobre ESEA y privacidad',
      pickGame: 'Elige un juego.',
      enTag: 'EN', enTitle: 'Esta actividad está en inglés',
      'today.title': 'Aprender hoy',
      'today.sub': 'Tres actividades cortas, unos 10 minutos.',
      'today.count': '{done} de 3 hechas',
      'today.greet': '¡Hola, {name}! Esto es lo que vamos a aprender hoy. ¡Empecemos con la primera!',
      'today.greetDone': '¡Hola, {name}! Ya terminaste todo lo de hoy. ¡Muy bien!',
      'today.reading': 'Lectura', 'today.math': 'Números', 'today.extra': 'Mirar y sentir',
      'today.start': '▶ Empezar', 'today.next': 'Siguiente', 'today.done': '✓ Hecho', 'today.again': 'Otra vez',
      'today.step': 'Paso {n}',
      'today.allDone': '¡Todo listo por hoy!',
      'today.allDoneText': '¡Muy bien, {name}! Ahora es hora de jugar lejos de la pantalla.',
      'today.homeIdea': 'Prueben esto juntos:',
      'today.backHome': 'Volver al inicio',
      backToPlan: '⭐ Volver al plan de hoy',
      items: {
        'math/quicklook.html': 'Mirada rápida', 'arithmetic/howmanyapple.html': 'Cuenta las manzanas', 'math/countto10.html': 'Cuenta hasta 10',
        'math/moreorless.html': 'Más o menos', 'math/whatsnext.html': '¿Qué sigue?', '123/pickthenum.html': 'Elige el número',
        'puzzles/number-match.html': 'Parejas de números', '123/countto100.html': 'Escucha los números del 1 al 100',
        'reading/rhyme.html': 'Rimas', 'reading/wordparts.html': 'Partes de palabras', 'reading/firstsounds.html': 'Primeros sonidos',
        'abc/alphabet-sounds.html': 'Sonidos de las letras', 'abc/picktheletter.html': 'Elige la letra', 'abc/abc.html': 'Di el abecedario',
        'abc/abcpic.html': 'Letras con dibujos', 'puzzles/letter-match.html': 'Parejas de letras', 'abc/pronunciation-symbols.html': 'Símbolos de sonidos',
        'color/colors.html': 'Aprende los colores', 'shapes/shapes.html': 'Aprende las formas', 'shapes/whatshape.html': '¿Qué forma es?',
        'puzzles/shape-match.html': 'Parejas de formas', 'abc/pickaword.html': 'Elige la palabra', 'abc/pickthepic.html': 'Elige el dibujo',
        'abc/kiddictionary.html': 'Mi libro de palabras', 'books/lego.html': '¿Quién se llevó mis Legos?', 'abc/calendar.html': 'Palabras del calendario',
        'weather/weather.html': 'El tiempo y las estaciones', 'emotions/emotions.html': 'Nombra mis emociones',
        'emotions/feelings-quiz.html': '¿Cómo se sienten?', 'emotions/calm-corner.html': 'Rincón de la calma', 'science/bio.html': 'Seres vivos',
        'puzzles/puzzles.html': 'Rompecabezas', 'puzzles/animal-match.html': 'Parejas de animales', 'puzzles/find-pairs.html': 'Encuentra las parejas',
        'puzzles/sort-game.html': 'Juego de clasificar', 'tv/tv.html': 'Todos los videos', 'tv/abc-with-pip.html': 'El ABC con Pip',
        'tv/count-with-pip.html': 'Contar con Pip', 'tv/animated-alphabet.html': 'Aventura del abecedario',
        'tv/counting-rainbow.html': 'Arcoíris de números', 'tv/sound-parade.html': 'Desfile de sonidos',
        'color/balloon-pop.html': 'Revienta globos', 'tv/colors-with-pip.html': 'Los colores con Pip',
        'tv/luna-little-cloud.html': 'Luna, la nubecita', 'tv/shapes-with-pip.html': 'Las formas con Pip',
        'tv/feelings-with-pip.html': 'Las emociones con Pip', 'tv/weather-with-pip.html': 'El tiempo con Pip',
        'tv/days-with-pip.html': 'Los días de la semana con Pip', 'tv/rhymes-with-pip.html': 'Rimas con Pip', 'tv/nature-with-pip.html': 'La naturaleza con Pip', 'tv/sorting-with-pip.html': 'Clasificar con Pip', 'tv/memory-with-pip.html': 'Memoria con Pip', 'tv/shape-match-with-pip.html': 'Formas con Pip: ¿dónde encaja?', 'tv/animal-match-with-pip.html': 'Animales con Pip: ¿quién es quién?', 'tv/number-match-with-pip.html': 'Números con Pip: ¿cuántos hay?', 'tv/letter-match-with-pip.html': 'Letras con Pip: mayúsculas y minúsculas'
      }
    },
    fr: {
      tagline: 'L’appli d’éveil des petits',
      'welcome.title': 'Un départ ludique pour les petits',
      'welcome.text': 'Des activités simples pour les enfants de 3 à 6 ans : écouter, regarder, toucher, nommer, compter, associer et fêter chaque petite réussite.',
      'section.foundations': 'Premières bases',
      'section.language': 'Langage et histoires',
      'section.whole': 'Développement de l’enfant',
      'card.numbers': 'Nombres', 'card.numbers.sub': 'Suivez les étapes : voir de petites quantités, compter, comparer et ranger les nombres.',
      'card.abc': 'ABC et lettres', 'card.abc.sub': 'Suivez les étapes : rimes, morceaux de mots, premiers sons, puis lettres (en anglais).',
      'card.colors': 'Couleurs', 'card.colors.sub': 'Apprendre le nom des couleurs avec des images claires et vives.',
      'card.shapes': 'Formes', 'card.shapes.sub': 'Trouver des cercles, des carrés, des triangles et d’autres formes du quotidien.',
      'card.words': 'Premiers mots', 'card.words.sub': 'Associer images et mots avant d’apprendre à épeler.',
      'card.stories': 'Histoires', 'card.stories.sub': 'Lire ensemble développe l’attention, le vocabulaire, la mémoire et la joie.',
      'card.routines': 'Routines du quotidien', 'card.routines.sub': 'Les jours, les mois et les saisons à travers des routines familières.',
      'card.feelings': 'Émotions', 'card.feelings.sub': 'Nommer les émotions, les reconnaître chez les autres et apprendre à se calmer.',
      'card.nature': 'Découvrir la nature', 'card.nature.sub': 'Observer les plantes, les animaux, la météo et les êtres vivants.',
      'card.matching': 'Jeux d’association', 'card.matching.sub': 'Mémoire, attention, chacun son tour et association d’images.',
      'card.videos': 'Regarder et écouter', 'card.videos.sub': 'De courtes vidéos à regarder ensemble, avec un adulte.',
      'educator.title': 'Conçu pour les premières années',
      'educator.text': 'Des activités courtes et concrètes, dans l’ordre où les jeunes enfants apprennent le plus souvent. Sans publicité, sans compte et sans classement.',
      'grownups.link': '👪 Espace adultes',
      'grownups.text': 'Voyez ce que votre enfant a appris, fixez un temps d’écran quotidien, ajoutez frères et sœurs et trouvez des idées pour la maison.',
      about: 'À propos d’ESEA et confidentialité',
      pickGame: 'Choisis un jeu.',
      enTag: 'EN', enTitle: 'Cette activité est en anglais',
      'today.title': 'Apprendre aujourd’hui',
      'today.sub': 'Trois petites activités, environ 10 minutes.',
      'today.count': '{done} sur 3 faites',
      'today.greet': 'Bonjour, {name} ! Voici ce qu’on apprend aujourd’hui. On commence par la première !',
      'today.greetDone': 'Bonjour, {name} ! Tu as tout fini pour aujourd’hui. Bravo !',
      'today.reading': 'Lecture', 'today.math': 'Nombres', 'today.extra': 'Regarder et ressentir',
      'today.start': '▶ Commencer', 'today.next': 'Ensuite', 'today.done': '✓ Fait', 'today.again': 'Rejouer',
      'today.step': 'Étape {n}',
      'today.allDone': 'Tout est fini pour aujourd’hui !',
      'today.allDoneText': 'Bravo, {name} ! Maintenant, c’est l’heure de jouer loin de l’écran.',
      'today.homeIdea': 'Essayez ensemble :',
      'today.backHome': 'Retour à l’accueil',
      backToPlan: '⭐ Retour au programme du jour',
      items: {
        'math/quicklook.html': 'Coup d’œil', 'arithmetic/howmanyapple.html': 'Compte les pommes', 'math/countto10.html': 'Compter jusqu’à 10',
        'math/moreorless.html': 'Plus ou moins', 'math/whatsnext.html': 'Et après ?', '123/pickthenum.html': 'Trouve le nombre',
        'puzzles/number-match.html': 'Associer les nombres', '123/countto100.html': 'Écoute les nombres de 1 à 100',
        'reading/rhyme.html': 'Les rimes', 'reading/wordparts.html': 'Morceaux de mots', 'reading/firstsounds.html': 'Premiers sons',
        'abc/alphabet-sounds.html': 'Les sons des lettres', 'abc/picktheletter.html': 'Trouve la lettre', 'abc/abc.html': 'Dis ton alphabet',
        'abc/abcpic.html': 'Lettres en images', 'puzzles/letter-match.html': 'Associer les lettres', 'abc/pronunciation-symbols.html': 'Symboles des sons',
        'color/colors.html': 'Apprends les couleurs', 'shapes/shapes.html': 'Apprends les formes', 'shapes/whatshape.html': 'Quelle est cette forme ?',
        'puzzles/shape-match.html': 'Associer les formes', 'abc/pickaword.html': 'Trouve le mot', 'abc/pickthepic.html': 'Trouve l’image',
        'abc/kiddictionary.html': 'Mon imagier', 'books/lego.html': 'Qui a pris mes Legos ?', 'abc/calendar.html': 'Les mots du calendrier',
        'weather/weather.html': 'Météo et saisons', 'emotions/emotions.html': 'Nomme mes émotions',
        'emotions/feelings-quiz.html': 'Comment se sentent-ils ?', 'emotions/calm-corner.html': 'Le coin calme', 'science/bio.html': 'Les êtres vivants',
        'puzzles/puzzles.html': 'Puzzles', 'puzzles/animal-match.html': 'Associer les animaux', 'puzzles/find-pairs.html': 'Trouve les paires',
        'puzzles/sort-game.html': 'Jeu de tri', 'tv/tv.html': 'Toutes les vidéos', 'tv/abc-with-pip.html': 'L’ABC avec Pip',
        'tv/count-with-pip.html': 'Compter avec Pip', 'tv/animated-alphabet.html': 'L’aventure de l’alphabet',
        'tv/counting-rainbow.html': 'L’arc-en-ciel des nombres', 'tv/sound-parade.html': 'La parade des sons',
        'color/balloon-pop.html': 'Éclate les ballons', 'tv/colors-with-pip.html': 'Les couleurs avec Pip',
        'tv/luna-little-cloud.html': 'Luna, le petit nuage', 'tv/shapes-with-pip.html': 'Les formes avec Pip',
        'tv/feelings-with-pip.html': 'Les émotions avec Pip', 'tv/weather-with-pip.html': 'La météo avec Pip',
        'tv/days-with-pip.html': 'Les jours de la semaine avec Pip', 'tv/rhymes-with-pip.html': 'Les rimes avec Pip', 'tv/nature-with-pip.html': 'La nature avec Pip', 'tv/sorting-with-pip.html': 'Trier avec Pip', 'tv/memory-with-pip.html': 'La mémoire avec Pip', 'tv/shape-match-with-pip.html': 'Les formes avec Pip : où ça va ?', 'tv/animal-match-with-pip.html': 'Les animaux avec Pip : qui est qui ?', 'tv/number-match-with-pip.html': 'Les nombres avec Pip : combien ?', 'tv/letter-match-with-pip.html': 'Les lettres avec Pip : majuscules et minuscules'
      }
    },
    en: {
      about: 'About ESEA & privacy',
      pickGame: 'Pick a game.',
      'today.title': 'Today’s learning',
      'today.sub': 'Three short activities, about 10 minutes.',
      'today.count': '{done} of 3 done',
      'today.greet': 'Hi, {name}! Here is today’s learning. Let’s start with the first one!',
      'today.greetDone': 'Hi, {name}! You finished everything for today. Great job!',
      'today.reading': 'Reading', 'today.math': 'Numbers', 'today.extra': 'Watch & feel',
      'today.start': '▶ Start', 'today.next': 'Up next', 'today.done': '✓ Done', 'today.again': 'Play again',
      'today.step': 'Step {n}',
      'today.allDone': 'All done for today!',
      'today.allDoneText': 'Great learning, {name}! Now it’s time to play away from the screen.',
      'today.homeIdea': 'Try this together:',
      'today.backHome': 'Back to home',
      backToPlan: '⭐ Back to today’s plan',
      items: {}
    }
  };

  // Pages that have content in Spanish and French (the others are in English).
  var MULTILINGUAL = {
    'math/quicklook.html': 1, 'arithmetic/howmanyapple.html': 1, 'math/countto10.html': 1,
    'math/moreorless.html': 1, 'math/whatsnext.html': 1, 'tv/tv.html': 1, 'color/balloon-pop.html': 1
  };

  function lang() {
    return global.ESEAFamily ? global.ESEAFamily.lang() : 'en';
  }

  function t(key, vars) {
    var dict = TEXT[lang()] || TEXT.en;
    var text = dict[key];
    if (text === undefined) text = TEXT.en[key];
    if (text === undefined) return null;
    if (vars) Object.keys(vars).forEach(function(k) { text = text.split('{' + k + '}').join(vars[k]); });
    return text;
  }

  // Activity name in the chosen language (href relative to the app root).
  function itemName(href, fallback) {
    var dict = TEXT[lang()] || TEXT.en;
    return (dict.items && dict.items[href]) || fallback;
  }

  function isMultilingual(href) { return Boolean(MULTILINGUAL[href]); }

  // Translate the page: [data-i18n] elements and activity links.
  function apply(root) {
    root = root || global.document;
    var current = lang();
    global.document.documentElement.lang = current;
    if (current === 'en') return;
    root.querySelectorAll('[data-i18n]').forEach(function(node) {
      var text = t(node.getAttribute('data-i18n'));
      if (text !== null) node.textContent = text;
    });
    root.querySelectorAll('a.dropdown-item').forEach(function(a) {
      var href = a.getAttribute('href').replace(/^\.\//, '');
      var name = itemName(href, null);
      if (name) {
        var textNode = Array.prototype.filter.call(a.childNodes, function(n) { return n.nodeType === 3 && n.textContent.trim(); })[0];
        if (textNode) textNode.textContent = name;
      }
      if (!isMultilingual(href) && !a.querySelector('.en-tag')) {
        var tag = global.document.createElement('span');
        tag.className = 'en-tag';
        tag.textContent = t('enTag');
        tag.title = t('enTitle');
        tag.setAttribute('aria-label', t('enTitle'));
        var badge = a.querySelector('.step-badge');
        a.insertBefore(tag, badge || null);
      }
    });
  }

  global.ESEAUI = { t: t, itemName: itemName, apply: apply, isMultilingual: isMultilingual };
  global.document.addEventListener('DOMContentLoaded', function() { apply(); });
})(window);
