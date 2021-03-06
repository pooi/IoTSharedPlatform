

function init(init_user) {

    var vue = new Vue({
        el: '#app',
        data: {
            title: 'IoT Shared Platform',
            options: {
                afterLoad: function(origin, destination, direction){
                    console.log(origin, destination, direction);
                    // if(vue != null){
                    //     var destinationIndex = destination.index;
                    //     // vue.toolbarItems[destinationIndex].color = "white";
                    //     if(origin != null){
                    //         var originIndex = origin.index;
                    //         vue.toolbarItems[originIndex].color = "grey lighten-1";
                    //     }
                    // }
                },
                menu: '#menu',
                navigation: true,
                loopTop: true,
                loopBottom: true,
                anchors: ['home', 'about', 'platform'],
                // sectionsColor: ['#41b883', '#2DA5E8', '#B0BEC5']
            },
            scrollData: {
                fab: false,
                offsetTop: 0,
                scrollT: 0,
                delta: 200,
                isShowFabTop: true,
                transition: 'slide-y-reverse-transition',
                statusBar: true
            },
            statusColor: "#ffaf1d",
            toolbarItems: [
                {
                    title: "Home",
                    href: "home",
                    color: "white"
                },
                {
                    title: "About",
                    href: "about",
                    color: "grey lighten-1"
                },
                {
                    title: "Platform",
                    href: "platform",
                    color: "grey lighten-1"
                }
            ],

            supporter: null,
            auth: new Auth(),

            mostViewItems: [],
            topRatingItems: [],

            cItems: [
                {
                    src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg'
                },
                {
                    src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg'
                },
                {
                    src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg'
                },
                {
                    src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg'
                }
            ]

        },
        methods:{
            onScroll (e) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);
                this.scrollData.offsetTop = scroll;

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                }

                if(scroll === 0){
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                    this.scrollData.offsetTop = 0;
                }

                if(!this.scrollData.statusBar && this.scrollData.offsetTop < 50){
                    this.scrollData.statusBar = !this.scrollData.statusBar;
                    // this.changeStatusBarColorOnNativeApp("orange");
                    // this.statusColor = this.supporter.getStatusLightOrange();
                }else if(this.scrollData.statusBar & this.scrollData.offsetTop >= 50){
                    this.scrollData.statusBar = !this.scrollData.statusBar;
                    // this.changeStatusBarColorOnNativeApp("white");
                    // this.statusColor = "#FFFFFF";
                }
            },
            changeStatusBarColorOnNativeApp(color){
                try {
                    console.log(color);
                    webkit.messageHandlers.changeStatusBarBGColor.postMessage(color);
                } catch (error) {

                }
                try{
                    window.Denl.changeStatusBarBGColor(color);
                }catch (e){

                }
            },
            goRecent: function () {
                var offset = 40;
                if(this.__proto__.$vuetify.breakpoint.smAndDown)
                    offset = -26;

                $('html, body').animate({
                    scrollTop: $('#recent').offset().top - offset
                }, 500);
            },
            // afterLoad: function(origin, destination, direction){
            //     console.log(origin, destination, direction);
            // }

        },
        mounted:[
            function () {
                this.auth.parseUserData(init_user);
            },
            function () {
                var data = {};

                axios.post(
                    '/mostView',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    for(var i=0; i<data.length; i++){
                        data[i].tags = JSON.parse(data[i].tags);
                        data[i].rgt_date = new Date(data[i].rgt_date);
                    }
                    vue.mostViewItems = [];
                    vue.mostViewItems = vue.mostViewItems.concat(data);
                }).catch(function (error) {
                    alert(error);
                    // vue.filterDialog = false;
                    // vue.isFilterProgress = false;
                });

                axios.post(
                    '/topRating',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    for(var i=0; i<data.length; i++){
                        data[i].tags = JSON.parse(data[i].tags);
                        data[i].rgt_date = new Date(data[i].rgt_date);
                    }
                    vue.topRatingItems = [];
                    vue.topRatingItems = vue.topRatingItems.concat(data);
                }).catch(function (error) {
                    alert(error);
                    // vue.filterDialog = false;
                    // vue.isFilterProgress = false;
                });
            },
            // function () {
            //     setTimeout(function () {
            //         alert(JSON.stringify(document.getElementsByClassName("animation-fade-in-2s")[0].style));
            //     }, 500);
            //
            // }
        ]
    });
    // vue.changeStatusBarColorOnNativeApp("orange");

    vue.supporter = new Supporter(vue);
    // vue.auth = new Auth(vue);

    return vue;
}