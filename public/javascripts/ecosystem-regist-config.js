

function init(init_user) {

    Vue.use(window.VueQuillEditor);

    var vue = new Vue({
        el: '#app',
        data: {
            title: 'IoT Shared Platform',
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
            bottomTab: "board",

            supporter: null,
            auth: new Auth(),
            graphManager: new GraphManager("graph"),
            viewer: null,

            editorTitle: null,

            editorOption: {
                // theme: 'bubble',
                placeholder: "Insert content here ...",
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        [{ 'header': 1 }, { 'header': 2 }],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        [{ 'script': 'sub' }, { 'script': 'super' }],
                        [{ 'indent': '-1' }, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        // [{ 'font': [] }],
                        ['blockquote', 'code-block', 'link'],
                        // ['clean'],
                        // ['link', 'image', 'video']
                    ],
                    // syntax: {
                    //     highlight: text => hljs.highlightAuto(text).value
                    // }
                }
            },

            content: null,
            capabilities: [
                {
                    title: "Button",
                    component: "switch"
                },
                {
                    title: "Button",
                    component: "switch"
                },
            ],
            platforms: [
                // {
                //     title: "SmartThings",
                //     company: "Samsung",
                //     cost: "Free",
                //     logo: "/images/logo/smartthings.png"
                // }
            ],
            addPlatformDialog: false,
            choosePlatformImageDialog: false,
            tempPlatform: null,
            detailPlatformDialog: false,
            detailPlatform: null,
            detailPlatformIndex: -1,

            products: [
                // {
                //     title: "Kasa Smart Plug",
                //     company: "TP-LINK",
                //     url: "https://www.tp-link.com/us/products/details/cat-5622_HS200.html",
                //     description: "Wi-Fi Smart Plug"
                // }
            ],
            addProductDialog: false,
            chooseProductImageDialog: false,
            tempProduct: null,
            detailProductDialog: false,
            detailProduct: null,
            detailProductIndex: -1,


        },
        methods:{
            onScroll (e) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);
                this.scrollData.offsetTop = scroll;

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    // this.chatManager.hide();
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    // this.chatManager.show();
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

            onEditorBlur(editor) {
                console.log('editor blur!');//, editor)
            },
            onEditorFocus(editor) {
                console.log('editor focus!');//, editor)
            },
            onEditorReady(editor) {
                console.log('editor ready!');//, editor)
            },

            addCapability: function () {
                this.capabilities.push({
                    title: "Button",
                    component: "switch"
                })
            },
            removeCapability: function (index) {
                if(index < this.capabilities.length){
                    this.capabilities.splice(index, 1);
                }
            },

            addPlatform: function () {

                var form = this.$refs.platform_form;
                if(form.validate()){
                    this.platforms.push(this.tempPlatform);
                    this.graphManager.addCircleNode(this.tempPlatform.title, this.tempPlatform.id);
                    this.addPlatformDialog = false;
                }

                // this.platforms.push({
                //     title: "Kasa Smart",
                //     company: "TP-LINK Research America",
                //     cost: "Free",
                //     logo: "/images/logo/tplink.png"
                // })
            },
            removePlatform: function (index) {
                if(index < this.platforms.length){
                    this.platforms.splice(index, 1);
                }
            },
            removePlatformFromDetail: function(){
                this.removePlatform(this.detailPlatformIndex);
                this.detailPlatform = null;
                this.detailPlatformIndex = -1;
                this.detailPlatformDialog= false;
            },
            resetPlatformForm: function () {
                this.tempPlatform = new Platform();
                this.choosePlatformImageDialog = false;
                this.addPlatformDialog = true;
                this.$refs["platform_url"].reset();
            },
            choosePlatformImage: function (index) {
                this.tempPlatform.img = this.tempPlatform.imgs[index];
                this.choosePlatformImageDialog = false;
            },
            showDetailPlatform: function (item, index) {
                this.detailPlatform = item;
                this.detailPlatformIndex = index;

                setTimeout(function () {
                    if(vue.detailPlatform.img !== null){
                        vue.viewer = new Viewer(document.getElementById('detailPlatformImg'), {
                            inline: false,
                            viewed: function() {
                                viewer.zoomTo(1);
                            }
                        });
                    }
                }, 500);

                this.detailPlatformDialog = true;
            },

            addProduct: function () {

                var form = this.$refs.product_form;
                if(form.validate()){
                    this.tempProduct.saveSelectedPlatform();
                    this.products.push(this.tempProduct);
                    this.graphManager.addNode(this.tempProduct.title, this.tempProduct.id);
                    this.addProductDialog = false;
                }

            },
            removeProduct: function (index) {
                if(index < this.products.length){
                    for(var i=0; i<this.platforms.length; i++){
                        this.platforms[i].deleteProduct(this.products[index]);
                    }
                    this.products.splice(index, 1);
                }
            },
            removeProductFromDetail: function(){
                this.removeProduct(this.detailProductIndex);
                this.detailProduct = null;
                this.detailProductIndex = -1;
                this.detailProductDialog= false;
            },
            resetProductForm: function () {
                this.tempProduct = new Product();
                this.chooseProductImageDialog = false;
                this.addProductDialog = true;
                this.$refs["product_url"].reset();
            },
            chooseProductImage: function (index) {
                this.tempProduct.img = this.tempProduct.imgs[index];
                this.chooseProductImageDialog = false;
            },
            showDetailProuct: function (item, index) {
                this.detailProduct = item;
                this.detailProductIndex = index;

                this.detailProduct.selectedPlatform = [];
                for(var i=0; i<this.platforms.length; i++){
                    if(this.platforms[i].isProductInclude(item)){
                        this.detailProduct.selectedPlatform.push(this.platforms[i]);
                    }
                }

                setTimeout(function () {
                    if(vue.detailProduct.img !== null){
                        vue.viewer = new Viewer(document.getElementById('detailProductImg'), {
                            inline: false,
                            viewed: function() {
                                viewer.zoomTo(1);
                            }
                        });
                    }
                }, 500);

                this.detailProductDialog = true;
            },

            parsingURL: function (type) {
                var urlField = null;
                var tempItem = null;
                if(type === "product"){
                    urlField = this.$refs["product_url"];
                    tempItem = this.tempProduct;
                }else if(type === "platform"){
                    urlField = this.$refs["platform_url"];
                    tempItem = this.tempPlatform;
                }


                if(urlField.valid){
                    tempItem.parsingProgress = true;
                    var data = {
                        url: tempItem.url
                    };

                    axios.post(
                        '/parseurl',
                        data
                    ).then(function (res) {
                        var data = res.data;
                        console.log(data);

                        tempItem.parsingProgress = false;
                        tempItem.parsingComplete = true;
                        tempItem.title = data.title;
                        tempItem.description = data.description;
                        tempItem.company = data.copyright;
                        tempItem.imgs = data.imgs;
                    }).catch(function (error) {
                        alert(error);
                    });

                }else{
                    urlField.validate(true);
                }

            },

            submit:function () {

                if(this.content === null || this.content === ""){

                }else{
                    var json = html2json(this.content);
                    console.log(json);
                    console.log(json2html(json));
                }

                var options = {compact: true, ignoreComment: true, spaces: 4};
                var result = xml2json(this.graphManager.toXML(), options);
                console.log(result);

                var newXml = json2xml(result, options);
                console.log(newXml);

                console.log("Submit");
            },

        },
        mounted:[
            function () {
                this.auth.parseUserData(init_user);
                this.auth.requireLogin();
            },
            function () {
                interact('#graph-container')
                    .resizable({
                        // resize from all edges and corners
                        edges: {left: false, right: false, bottom: true, top: false},

                        // keep the edges inside the parent
                        restrictEdges: {
                            outer: 'parent',
                            endOnly: true,
                        },

                        // minimum size
                        restrictSize: {
                            min: {width: 100, height: 100},
                        },

                        inertia: true,

                        onmove: function (event) {
                            // console.log(event);
                        }
                    })
                    .on('resizemove', function (event) {
                        var target = event.target,
                            x = (parseFloat(target.getAttribute('data-x')) || 0),
                            y = (parseFloat(target.getAttribute('data-y')) || 0);

                        // update the element's style
                        target.style.width = event.rect.width + 'px';
                        target.style.height = event.rect.height + 'px';

                        // translate when resizing from top or left edges
                        x += event.deltaRect.left;
                        y += event.deltaRect.top;

                        target.style.webkitTransform = target.style.transform =
                            'translate(' + x + 'px,' + y + 'px)';

                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                        // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
                    });
            }
        ],
        computed: {
            editor() {
                return this.$refs.myTextEditor.quill
            },
            // contentCode() {
            //     return hljs.highlightAuto(this.content).value
            // }
        },
    });

    vue.supporter = new Supporter(vue);
    // vue.auth = new Auth(vue);

    return vue;
}