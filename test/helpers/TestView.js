function TestView() {
  this.childViews = [];
  this.parentView = null;
}

TestView.prototype.addChild = function (view) {
  view.parentView = this;
  this.childViews.push(view);
};


