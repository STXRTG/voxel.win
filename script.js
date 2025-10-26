document.addEventListener('DOMContentLoaded', function() {
    try {
        initializePageContent();
        
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });

        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        function disableDevTools(event) {
            if (
                event.keyCode === 123 ||
                (event.ctrlKey && event.shiftKey && event.keyCode === 73) ||
                (event.ctrlKey && event.shiftKey && event.keyCode === 74) ||
                (event.ctrlKey && event.keyCode === 85)
            ) {
                event.preventDefault();
                return false;
            }
        }

        document.addEventListener('keydown', disableDevTools);

        const video = document.getElementById('background-video');
        const volumeController = document.getElementById('volume-controller');
        const volumeButton = document.getElementById('volume-button');
        const volumeIcon = document.getElementById('volume-icon');
        const volumeSlider = document.getElementById('volume-slider');
        const overlay = document.getElementById('overlay');
        const content = document.getElementById('content');
        const downloadButton = document.getElementById('download-button');
        let isMuted = false;
        let previousVolume = 50;

        if (!video || !volumeController || !volumeButton || !volumeIcon || !volumeSlider || !overlay || !content || !downloadButton) {
            return;
        }

        video.volume = 0.5;
        volumeSlider.value = 50;

        overlay.addEventListener('click', function() {
            this.classList.add('hidden');
            content.style.display = 'block';
            downloadButton.style.display = 'flex';
            video.muted = false;
            video.play().catch(error => {});
        });

        volumeButton.addEventListener('click', function() {
            isMuted = !isMuted;
            if (isMuted) {
                previousVolume = volumeSlider.value;
                video.volume = 0;
                volumeIcon.src = CONFIG.media.volumeOffIcon;
                volumeSlider.value = 0;
            } else {
                video.volume = previousVolume / 100;
                volumeIcon.src = CONFIG.media.volumeOnIcon;
                volumeSlider.value = previousVolume;
            }
        });

        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            video.volume = volume;
            previousVolume = this.value;
            if (volume > 0) {
                isMuted = false;
                video.muted = false;
                volumeIcon.src = CONFIG.media.volumeOnIcon;
            } else {
                isMuted = true;
                volumeIcon.src = CONFIG.media.volumeOffIcon;
            }
        });

        initializeTypingAnimation();

        initialize3DTiltEffect();

        downloadButton.addEventListener('click', function() {
            const link = document.createElement('a');
            link.href = CONFIG.download.url;
            link.download = CONFIG.download.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

    } catch (error) {
    }
});

function initializePageContent() {
    loadCustomFonts();
    document.title = CONFIG.page.title;
    
    const overlaySpan = document.querySelector('#overlay span');
    if (overlaySpan) {
        overlaySpan.textContent = CONFIG.overlay.enterText;
    }

    const video = document.getElementById('background-video');
    if (video) {
        const source = video.querySelector('source');
        if (source) {
            source.src = CONFIG.media.backgroundVideo;
            video.load();
        }
    }

    const volumeIcon = document.getElementById('volume-icon');
    if (volumeIcon) {
        volumeIcon.src = CONFIG.media.volumeOnIcon;
    }

    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.src = CONFIG.user.avatar;
    }

    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        const textNode = usernameElement.childNodes[0];
        if (textNode) {
            textNode.textContent = CONFIG.user.username;
        } else {
            usernameElement.innerHTML = CONFIG.user.username + usernameElement.innerHTML;
        }
    }

    const uidElement = document.querySelector('.uid');
    if (uidElement) {
        uidElement.textContent = `UID: ${CONFIG.user.uid}`;
    }

    const badgesContainer = document.querySelector('.badges-container');
    if (badgesContainer && CONFIG.badges.length > 0) {
        badgesContainer.innerHTML = '';
        CONFIG.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.title = badge.title;
            badgeElement.innerHTML = `
                <img src="${badge.image}" alt="">
                <div class="badge-name">${badge.name}</div>
            `;
            badgesContainer.appendChild(badgeElement);
        });
    }

    const socialIcons = document.querySelector('.social-icons');
    if (socialIcons && CONFIG.social.length > 0) {
        socialIcons.innerHTML = '';
        CONFIG.social.forEach(social => {
            const iconElement = document.createElement('div');
            iconElement.className = 'icon';
            
            if (social.url) {
                iconElement.onclick = () => window.open(social.url);
            }
            
            iconElement.innerHTML = `
                <img src="${social.image}" alt="">
                ${social.displayName ? `<div class="social-name">${social.displayName}</div>` : ''}
            `;
            socialIcons.appendChild(iconElement);
        });
    }

    const downloadButtonImg = document.querySelector('#download-button img');
    if (downloadButtonImg) {
        downloadButtonImg.src = CONFIG.media.downloadIcon;
    }
}

function initializeTypingAnimation() {
    const typingTextElement = document.getElementById('typing-text');
    if (!typingTextElement) return;

    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = CONFIG.typing.phrases[currentPhraseIndex];
        const typingSpeed = CONFIG.typing.typingSpeed;
        const deletingSpeed = CONFIG.typing.deletingSpeed;
        const pauseTime = CONFIG.typing.pauseTime;

        if (!isDeleting && currentCharIndex <= currentPhrase.length) {
            typingTextElement.textContent = currentPhrase.slice(0, currentCharIndex);
            currentCharIndex++;
            setTimeout(type, typingSpeed);
        } else if (isDeleting && currentCharIndex > 0) {
            typingTextElement.textContent = currentPhrase.slice(0, currentCharIndex - 1);
            currentCharIndex--;
            setTimeout(type, deletingSpeed);
        } else if (!isDeleting && currentCharIndex > currentPhrase.length) {
            setTimeout(() => {
                isDeleting = true;
                type();
            }, pauseTime);
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % CONFIG.typing.phrases.length;
            setTimeout(type, 500);
        }
    }

    setTimeout(type, 500);
}

function initialize3DTiltEffect() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;

    let rotateY = 0;
    let rotateX = 0;

    profileContainer.addEventListener('mousemove', function (e) {
        const rect = profileContainer.getBoundingClientRect();
        const sensitivity = CONFIG.animation.mouseSensitivity;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        rotateX = ((y / rect.height) - 0.5) * sensitivity;
        rotateY = ((x / rect.width) - 0.5) * -sensitivity;

        profileContainer.style.setProperty('--xv', `${rotateX}deg`);
        profileContainer.style.setProperty('--yv', `${rotateY}deg`);
    });

    profileContainer.addEventListener('mouseleave', function () {
        setTimeout(() => {
            profileContainer.style.setProperty('--xv', `0deg`);
            profileContainer.style.setProperty('--yv', `0deg`);
        }, CONFIG.animation.mouseLeaveDelay);
    });
}

function loadCustomFonts() {
    if (CONFIG.fonts && CONFIG.fonts.googleFonts) {
        CONFIG.fonts.googleFonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = fontUrl;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    if (CONFIG.fonts) {
        const style = document.createElement('style');
        style.textContent = `
            *, .username, .profile-description, #typing-text, .badge-name, .social-name, .uid, .overlay span {
                font-family: ${CONFIG.fonts.primary} !important;
            }
        `;
        document.head.appendChild(style);
    }
}