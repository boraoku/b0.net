// C64-style loading and animation controller
(function() {
    'use strict';

    var loadingBar = document.getElementById('loadingBar');
    var container = document.getElementById('container');
    var c64Loader = document.getElementById('c64Loader');
    var c64Lines = document.getElementById('c64Lines');
    var progress = 0;

    // Full C64 color palette
    var c64Colors = [
        '#000000', // black
        '#ffffff', // white
        '#9f4e44', // red
        '#6abfc6', // cyan
        '#a057a3', // purple
        '#5cab5e', // green
        '#50459b', // blue
        '#c9d487', // yellow
        '#a1683c', // orange
        '#6d5412', // brown
        '#cb7e75', // light red
        '#626262', // dark grey
        '#898989', // grey
        '#9ae29b', // light green
        '#887ecb', // light blue
        '#adadad', // light grey
    ];

    // Create C64 loading lines
    var lineCount = Math.ceil(window.innerHeight / 3);
    var lines = [];
    var animationInterval;

    function initC64Lines() {
        for (var i = 0; i < lineCount; i++) {
            var line = document.createElement('div');
            line.className = 'c64-line';
            c64Lines.appendChild(line);
            lines.push(line);
        }
    }

    function animateC64Lines() {
        // Chaotic color changes across all lines like tape loading
        for (var i = 0; i < lines.length; i++) {
            if (Math.random() > 0.6) {
                var colorIndex = Math.floor(Math.random() * c64Colors.length);
                lines[i].style.backgroundColor = c64Colors[colorIndex];
            }
        }
    }

    function initRandomColors() {
        // Fill all lines with random colors immediately
        for (var i = 0; i < lines.length; i++) {
            var colorIndex = Math.floor(Math.random() * c64Colors.length);
            lines[i].style.backgroundColor = c64Colors[colorIndex];
        }
    }

    // Images to preload (including background)
    var imagesToLoad = [
        'images/background-sydney-sandstone.jpg',
        'images/profile.jpeg',
        'images/hetge.jpg',
        'images/hetge-logo.svg',
        'images/spotify-cover.jpg'
    ];

    var loadedCount = 0;
    var totalImages = imagesToLoad.length;
    var minDisplayTime = 1000; // Minimum 1 seconds display
    var startTime = Date.now();

    function updateProgress(amount) {
        progress = Math.min(progress + amount, 100);
        loadingBar.style.width = progress + '%';
    }

    function onAllLoaded() {
        // Complete the progress bar
        loadingBar.style.width = '100%';
        progress = 100;

        // Calculate remaining time to meet minimum display
        var elapsed = Date.now() - startTime;
        var remainingTime = Math.max(0, minDisplayTime - elapsed);

        // Wait for minimum display time
        setTimeout(function() {
            // Final burst of line animation
            for (var i = 0; i < lines.length; i++) {
                var colorIndex = Math.floor(Math.random() * c64Colors.length);
                lines[i].style.backgroundColor = c64Colors[colorIndex];
            }

            setTimeout(function() {
                // Stop C64 animation
                clearInterval(animationInterval);

                // Hide C64 loader
                c64Loader.classList.add('hidden');

                // Fade out loading bar
                loadingBar.classList.add('complete');

                // Show background (now fully loaded)
                document.body.classList.add('bg-loaded');

                // Show container with fade in
                container.classList.add('loaded');

                // Animate cards with stagger
                initCardAnimations();

                // Remove C64 loader from DOM after transition
                setTimeout(function() {
                    c64Loader.remove();
                }, 500);
            }, 300);
        }, remainingTime);
    }

    function initCardAnimations() {
        var cards = document.querySelectorAll('.card');

        cards.forEach(function(card, index) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

            setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 80));
        });
    }

    function preloadImage(src) {
        return new Promise(function(resolve) {
            var img = new Image();
            img.onload = function() {
                loadedCount++;
                updateProgress(100 / totalImages);
                resolve();
            };
            img.onerror = function() {
                loadedCount++;
                updateProgress(100 / totalImages);
                resolve();
            };
            img.src = src;
        });
    }

    // Initialize
    initC64Lines();
    initRandomColors();

    // Start C64 line animation
    animationInterval = setInterval(animateC64Lines, 30);

    // Start loading
    updateProgress(5); // Initial progress to show activity

    Promise.all(imagesToLoad.map(preloadImage)).then(onAllLoaded);

    // Spotify tracklist auto-scroll on hover (desktop) or when visible (mobile)
    function initSpotifyScroll() {
        var tracklist = document.querySelector('.spotify-tracklist');
        var spotifyCard = document.querySelector('.card-spotify');
        if (!tracklist || !spotifyCard) return;

        var scrollInterval = null;
        var scrollDirection = 1; // 1 = down, -1 = up
        var scrollSpeed = 3; // pixels per frame

        // Detect touch device
        var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        function autoScroll() {
            var maxScroll = tracklist.scrollHeight - tracklist.clientHeight;
            var currentScroll = tracklist.scrollTop;

            // Check boundaries before scrolling and reverse if needed
            if (scrollDirection === 1 && currentScroll >= maxScroll - 1) {
                scrollDirection = -1;
            } else if (scrollDirection === -1 && currentScroll <= 1) {
                scrollDirection = 1;
            }

            tracklist.scrollTop += scrollDirection * scrollSpeed;
        }

        function startScroll() {
            if (!scrollInterval) {
                scrollInterval = setInterval(autoScroll, 30);
            }
        }

        function stopScroll() {
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
        }

        if (isTouchDevice) {
            // Mobile: Always scroll continuously
            startScroll();
        } else {
            // Desktop: Use hover
            spotifyCard.addEventListener('mouseenter', startScroll);
            spotifyCard.addEventListener('mouseleave', stopScroll);
        }
    }

    // Initialize spotify scroll after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpotifyScroll);
    } else {
        initSpotifyScroll();
    }
})();
