const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const heading = $('header h2')
const cd = $('.cd')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đừng làm trái tim anh đau (Cover)',
            singer: 'Bảo Yến Rosie',
            path: './assets/music/dung-lam-trai-tim-anh-dau.mp3',
            image: './assets/image/dung-lam-trai-tim-anh-dau.jpeg'
        },
        {
            name: 'Nắng có mang em về',
            singer: 'Shartnuss, Tr.D',
            path: './assets/music/nang-co-mang-em-ve.mp3',
            image: './assets/image/nang-co-mang-em-ve.jpg'
        },
        {
            name: '3107-2',
            singer: 'W/n, DuongG, Nâu',
            path: './assets/music/3107-2.mp3',
            image: './assets/image/3107-2.jpg'
        },
        {
            name: 'Yên bình có quá đắt không',
            singer: 'Khiem',
            path: './assets/music/yen-binh-co-qua-dat-khong.mp3',
            image: './assets/image/yen-binh-co-qua-dat-khong.jpg'
        },
        {
            name: 'Nổi gió lên (Single)',
            singer: 'Phan Như Thùy',
            path: './assets/music/noi-gio-len.mp3',
            image: './assets/image/noi-gio-len.jpg'
        },
        {
            name: 'Ghosting (Lê Bảo remix)',
            singer: 'Linh Ka',
            path: './assets/music/ghosting.mp3',
            image: './assets/image/ghosting.jpg'
        },
        {
            name: '11:11 (11 giờ 11 phút)',
            singer: 'MiiNa (DREAMeR), RIN9, Bảo Uyên, V.A',
            path: './assets/music/11-gio-11-phut.mp3',
            image: './assets/image/11-gio-11-phut.jpg'
        },
        {
            name: 'Mặt mộc',
            singer: 'Phạm Nguyên Ngọc, VAnh, Ân Nhi',
            path: './assets/music/mat-moc.mp3',
            image: './assets/image/mat-moc.jpg'
        },
        {
            name: 'Một đường đời hoa',
            singer: 'Ôn Dịch Tâm',
            path: './assets/music/mot-duong-no-hoa.mp3',
            image: './assets/image/mot-duong-no-hoa.jpg'
        },
        {
            name: 'Giày cao gót màu đỏ',
            singer: 'Thái Kiện Nhã',
            path: './assets/music/giay-cao-got-mau-do.mp3',
            image: './assets/image/giay-cao-got-mau-do.jpg'
        }
    ],
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                        <div class="thumb"
                            style="background-image: url('${song.image}');">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
        })
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop

            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0

            const newOpacity =  newCdWidth / cdWidth 
            cd.style.opacity = newOpacity > 0 ? newOpacity : 0
        }

        // Xử lí khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }   
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.ceil(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua bài hát
        progress.onmousedown = function() {
            audio.ontimeupdate = function() {}
        }

        progress.onchange= function(e) {
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
            audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.ceil(audio.currentTime / audio.duration * 100)
                    progress.value = progressPercent
                }
            }
        }

        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý bật / tắt repeat song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next / repeat song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                    _this.scrollToActiveSong()
                }

                // Xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },
    loadCurrentSong() {
        heading.innerText = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();
    },
    prevSong() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },
    playRandomSong() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong();
    },
    start() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlist
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
} 

app.start()