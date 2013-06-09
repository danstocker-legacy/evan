/*global dessert, troop, sntls, evan */
troop.promise(evan, 'PathCollection', function () {
    "use strict";

    /**
     * @name evan.PathCollection.create
     * @return {evan.PathCollection}
     */

    /**
     * @class evan.PathCollection
     * @extends sntls.Collection
     * @extends sntls.Path
     */
    evan.PathCollection = sntls.Collection.of(sntls.Path);
});
