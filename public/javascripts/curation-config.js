function init(init_user, curationType) {

    var vue = new Vue({
        el: '#app',
        data: {
            title: 'IoT Shared Platform',

            options: {
                afterLoad: function(origin, destination, direction){
                    console.log(origin, destination, direction);
                    if(vue != null){
                        var destinationIndex = destination.index;
                        vue.toolbarItems[destinationIndex].color = "white";
                        if(origin != null){
                            var originIndex = origin.index;
                            vue.toolbarItems[originIndex].color = "grey lighten-1";
                        }
                    }
                },
                menu: '#menu',
                //navigation: true,
                anchors: ['home', 'about'],
                sectionsColor: ['#41b883', '#ff5f45']
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
            ],
            statusColor: "#ffaf1d",
            bottomTab: "board",

            supporter: null,
            auth: new Auth(),

            pageData: [],

            // for Curation
            e1: 0,
            search: "",
            value: 1,
            tagList: [],
            price: [0, 500000],
            cost: [0, 1000000],
            minPrice: 0,
            maxPrice: 500000,
            checkedTag: [],
            checkedCapa: [],
            loadingWizard: false,
            completeCuration: false,
            prevCuration: true,
            noResult: true,
            curateProduct: [],
            curateResult: [],
            curateEcosystem: [],
            resultCnt: 0,
            items: [],
            loading: false,

            // for Tag
            tagLoading: false,
            TAG: null,
            tags: [],

            // for Capabilities
            capabilityLoading: false,
            CAPABILITY: null,
            capa_name: ["aircon"],

            detailCapabilityDialog: false,
            detailCapabilityDialogPos: {
                x: 0,
                y: 0
            },
            detailCapability: null,
            detailCapabilityProducts: [],

            result: null,
            pagination: {
                sortBy: 'capability',
                page: 1,
                rowsPerPage: 10
            },
            selected: [],
            headers: [
                {
                    text: 'Capability',
                    value: 'capability'
                },
                { 
                    text: 'Description', 
                    value: 'description' }
            ],

            message: [

            ]
        },
        methods: {
            startCuration() {
                vue.prevCuration = false;
            },
            isInt(n) {
                return n % 1 === 0;
            },
            say: function (msg) {
                alert(msg);
            },
            // getPageData: function () {
            //     this.loading = true;
            //     var data = {
            //         type: this.
            //     }

            // },
            onComplete: function() {
                this.completeCuration = false;
                this.curateProduct = [];
                this.curateResult = []; // ProductName
                this.curateEcosystem = [];
                this.resultCnt = 0;
                // this.noResult = true;

                console.log(curationType);

                if(curationType == "ecosystem") {
                    this.curateEcosystemList();
                } else if(curationType == "product") {
                    console.log("???");
                    this.curateProductList();
                }
                // this.completeCuration = true;
            },
            gotoCuration: function() {
                this.completeCuration = false;  
                this.noResult = true;
            },
            setLoading: function(value) {
                this.loadingWizard = value;
            },
            handleValidation: function(isValid, tabIndex) {
                console.log('Tab: '+tabIndex+' valid: '+isValid);
            },
            validatePrice: function() {
                if(curationType == "ecosystem") {
                    this.minPrice = this.cost[0];
                    this.maxPrice = this.cost[1];
                } else {
                    this.minPrice = this.price[0];
                    this.maxPrice = this.price[1];
                }
                
                if(!this.isInt(this.minPrice) || !this.isInt(this.maxPrice)) {
                    alert("숫자만 입력해 주세요");
                    return false;
                }
                if(this.minPrice < 0 && this.minPrice != "") {
                    alert("0 이상의 값을 입력해 주세요");
                    return false;
                }
                if(this.maxPrice > 10000000 && this.maxPrice != "") {
                    alert("10,000,000 이하의 값을 입력해 주세요");
                    return false;
                }
                // if(this.minPrice == "" || this.maxPrice == "") {
                //     alert("값을 입력해 주세요");
                //     return false;
                // }
                
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 500)
                });
            },
            validateTag: function() {
                if(this.checkedTag.length <= 0) {
                    alert("1개 이상 선택해 주세요");
                    return false;
                }
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 500)
                });
            },
            validateCapa: function() {
                if(this.checkedCapa.length <= 0) {
                    alert("1개 이상 선택해 주세요");
                    return false;
                }
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true);
                    }, 500)
                });
            },
            getCapabilityList: function(){
                this.capabilityLoading = true;

                var data = "";

                axios.post(
                    '/getCapabilities',
                    data
                ).then(function (res) {
                    var data = res.data;
                    //console.log(data);

                    vue.CAPABILITY = data;
                    for(var i = 0; i < data.length; i++) vue.capa_name[i] = data[i].capability;

                    vue.totalCapabilities = JSON.parse(JSON.stringify(vue.CAPABILITY ));
                    vue.capabilityLoading = false;

                    // vue.tempCapabilities = [];
                    // for(var i=0; i<vue.CAPABILITY.length; i++){
                    //     var data = vue.CAPABILITY[i];
                    //     data['check'] = false;
                    //     vue.tempCapabilities.push(data);
                    // }

                }).catch(function (error) {
                    alert(error);
                });
            },
            getTagList: function() {
                this.tagLoading = true;

                axios.post(
                    '/getTag'
                ).then(function (res) {
                    var data = res.data;

                    vue.TAG = res.data;
                    vue.tagLoading = false;

                });
            },
            curateProductList: function(callback) {
                vue.loading = true;
                var data = {
                    minPrice: this.minPrice,
                    maxPrice: this.maxPrice,
                    checkedTag: this.checkedTag,
                    checkedCapa: this.checkedCapa
                }
                console.log("zzz", data);
                axios.post(
                    '/curation/curateProduct',
                    data
                ).then(function (res) {

                    var data = res.data;
                    console.log("aaa", data);
                    vue.curateProduct = data;

                    if(vue.curateProduct.length > 0) {
                        
                        for(var i = 0; i < vue.curateProduct.length; i++) {
                            //vue.parsingURL(vue.curateProduct[i]);
                            var tempResult = {
                                title: null,
                                description: null,
                                company: null,
                                url: null,
                                imgUrl: null
                            };
                            var product = vue.curateProduct[i];
                            tempResult.title = product.name;
                            tempResult.category = product.category;
                            tempResult.description = product.description;
                            tempResult.company = product.manufacturer;
                            tempResult.url = product.url;
                            tempResult.imgUrl = product.imgUrl;
                            vue.curateResult[i] = tempResult;
                            vue.resultCnt++;
                        }

                        
                        console.log(JSON.stringify(vue.curateProduct));
                        vue.noResult = false;
                    }else{
                        vue.noResult = true;
                    }

                    vue.completeCuration = true;
                    vue.loading = false;

                }).catch(function (error) {
                    alert(error);
                    vue.loading = false;
                });
            },
            curateEcosystemList: function(callback) {
                vue.loading = true;
                var data = {
                    minPrice: this.minPrice,
                    maxPrice: this.maxPrice,
                    checkedTag: this.checkedTag,
                    checkedCapa: this.checkedCapa
                }
                console.log("xxx", data);
                axios.post(
                    '/curation/curateEcosystem',
                    data
                ).then(function(res) {

                    console.log(res);

                    var cntOfCapa = res.data[0][0];
                    var data = res.data[2];

                    vue.items = data;

                    if(vue.items.length > 0) {
                        for(var i=0; i<vue.items.length; i++){
                            vue.items[i].rgt_date = new Date(vue.items[i].rgt_date);
                            vue.items[i].tags = JSON.parse(vue.items[i].tags);
                        }

                        vue.noResult = false;
                    }else{
                        vue.noResult = true;
                    }
                    
                    vue.completeCuration = true;
                    vue.loading = false;

                }).catch(function (error) {
                    alert(error);
                    vue.loading = false;
                });
            }
            // parsingURL: function (product) {

            //     var data = {
            //         url: product.url
            //     };

            //     axios.post(
            //         '/parseurl',
            //         data
            //     ).then(function (res) {
            //         var data = res.data;
            //         var tempResult = {
            //             title: null,
            //             description: null,
            //             company: null,
            //             imgUrl: null
            //         }
            //         tempResult.title = product.name;
            //         tempResult.description = product.description;
            //         tempResult.company = data.copyright;
            //         tempResult.imgUrl = product.imgUrl;
            //         vue.curateResult[vue.resultCnt] = tempResult;
            //         vue.resultCnt++;

            //     }).catch(function (error) {
            //         alert(error);
            //     });
            // }
        },
        mounted: [
            function () {
                this.auth.parseUserData(init_user);
                this.auth.requireLogin();
            },
            function () {
                this.getCapabilityList();
                this.getTagList();
                this.getPageData();
            }
        ],
        computed: {
            totalCapabilities: function () {
                var capabilities = null;
                if(this.CAPABILITY !== null){
                    capabilities = JSON.parse(JSON.stringify(this.CAPABILITY));
                    for(var i=0; i<capabilities.length; i++){
                        capabilities[i].check = false;
                    }

                    var haveCapa = false;
                    for(var i=0; i<this.products.length; i++){
                        var product = this.products[i];
                        if(product.capabilities !== null && product.capabilities.length > 0){
                            for(var j=0; j<product.capabilities.length; j++){
                                if(product.capabilities[j].check){
                                    haveCapa = true;
                                    capabilities[j].check = true;
                                }
                            }
                        }
                    }

                    if(!haveCapa){
                        capabilities = null;
                    }
                }

                return capabilities
            }
            // contentCode() {
            //     return hljs.highlightAuto(this.content).value
            // }
        },
        components: {
            'vueSlider': window[ 'vue-slider-component' ],
        }
    });

    vue.supporter = new Supporter(vue);

    return vue;
}