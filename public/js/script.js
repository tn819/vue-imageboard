(function() {
    Vue.component("modal", {
        template: "#modal-template"
    });
    new Vue({
        el: "#main",
        data: {
            images: [],
            numColumns: 3
        },
        mounted: function() {
            var self = this;
            axios
                .get("/images")
                .then(function(resp) {
                    console.log("images in vue", resp.data);
                    self.images = resp.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        computed: {
            rowCount: function() {
                return Math.floor(images.length / numColumns) + 1;
            }
        }
    });
})();
