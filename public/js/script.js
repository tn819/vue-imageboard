(function() {
    Vue.component("image-modal-template", {
        props: ["image"],
        template: "#image-modal-template",
        data: function() {
            return {
                comments: [],
                id: "",
                username: "",
                comment: ""
            };
        },
        mounted: function() {
            var self = this;
            axios
                .get("/comments/" + self.image.id)
                .then(function(resp) {
                    console.log("getting comments", resp.data);
                    self.comments = resp.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        methods: {
            postComment: function() {
                var commentToSubmit = {
                    comment: this.comment,
                    username: this.username,
                    image_id: this.image.id
                };
                var self = this;
                axios
                    .post("/comment", commentToSubmit)
                    .then(function(resp) {
                        console.log("then of POST /addComment!", resp);
                        self.comment = "";
                        self.username = "";
                        self.comments.unshift(resp.data[0]);
                        self.$forceUpdate();
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        }
    });

    Vue.component("image-card", {
        props: ["image"],
        template: "#image-card",
        methods: {
            launchModal: function() {
                this.$emit("launch-modal", this.image);
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            page: 1,
            imagePerPage: 10,
            images: [],
            pages: [],
            form: {
                title: "",
                description: "",
                username: "",
                file: null
            },
            showModal: false,
            modalImage: {
                id: location.hash.slice(1) || null,
                url: "",
                username: "",
                title: "",
                description: "",
                comments: []
            }
        },
        watch: {
            "modalImage.id": function() {
                var self = this;
                if (!self.modalImage.url && self.modalImage.id) {
                    axios
                        .get("/images/" + self.modalImage.id)
                        .then(function(resp) {
                            self.modalImage.url = resp.data.url;
                            self.modalImage.created_at = resp.data.created_at;
                            self.modalImage.username = resp.data.username;
                            self.modalImage.title = resp.data.title;
                            self.modalImage.description = resp.data.description;
                            return axios.get("/comments/" + self.modalImage.id);
                        })
                        .then(function(resp) {
                            self.modalImage.comments = resp.data;
                            self.showModal = true;
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                } else if (self.modalImage.url && self.modalImage.id) {
                    axios
                        .get("/comments/" + self.modalImage.id)
                        .then(function(resp) {
                            self.modalImage.comments = resp.data;
                            self.showModal = true;
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                } else {
                    return;
                }
            },
            images() {
                this.setPages();
            }
        },
        computed: {
            displayedImages() {
                return this.paginate(this.images);
            }
        },

        created: function() {
            var self = this;
            window.addEventListener("hashchange", function() {
                self.modalImage.id = location.hash.slice(1);
            });
            if (window.location.hash) {
                self.modalImage.id = location.hash.slice(1);
                axios
                    .get("/images/" + self.modalImage.id)
                    .then(function(resp) {
                        self.modalImage.url = resp.data.url;
                        self.modalImage.created_at = resp.data.created_at;
                        self.modalImage.username = resp.data.username;
                        self.modalImage.title = resp.data.title;
                        self.modalImage.description = resp.data.description;
                        return axios.get("/comments/" + self.modalImage.id);
                    })
                    .then(function(resp) {
                        self.modalImage.comments = resp.data;
                        self.showModal = true;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            } else {
                axios
                    .get("/images")
                    .then(function(resp) {
                        self.images = resp.data;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }
        },
        methods: {
            launchModal: function(clickedImage) {
                console.log(clickedImage);
                Object.assign(this.modalImage, clickedImage);
                this.showModal = true;
                console.log(this.modalImage, "receiving image");
            },
            closeModal: function() {
                var self = this;
                this.showModal = false;
                this.modalImage = {};
                this.modalImage.id = null;
                history.replaceState(
                    "",
                    document.title,
                    window.location.pathname + window.location.search
                );
                if (this.images.length == 0) {
                    axios
                        .get("/images")
                        .then(function(resp) {
                            self.images = resp.data;
                            if (!window.location.href) {
                                window.location.href = window.location.href;
                            } else {
                                window.location.reload(true);
                            }
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            },
            handleFileChange: function(e) {
                this.form.file = e.target.files[0];
            },
            uploadFile: function() {
                var self = this;
                var formData = new FormData();
                for (key in this.form) {
                    formData.append(key, this.form[key]);
                }
                axios.post("/image", formData).then(function(resp) {
                    console.log("then of POST /addImage!", resp);
                    self.images.unshift(resp.data[0]);
                    self.$forceUpdate();
                });
            },
            setPages: function() {
                var numberOfPages = Math.ceil(
                    this.images.length / this.imagePerPage
                );
                for (var index = 1; index <= numberOfPages; index++) {
                    this.pages.push(index);
                }
            },
            //I owe a lot to the approach suggested in this post: https://medium.com/@obapelumi/pagination-with-vuejs-1f505ce8d15b
            paginate: function(posts) {
                var page = this.page;
                var perPage = this.imagePerPage;
                var from = page * perPage - perPage;
                var to = page * perPage;
                return this.images.slice(from, to);
            }
        }
    });
})();
