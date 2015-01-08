import SidePanelView from '../side-panel';

const LEFT_ARROW_KEY = 37;
const RIGHT_ARROW_KEY = 39;

export default SidePanelView.extend({
  classNameBindings: [':project'],
  tagName: 'article',

  setupArrowKeysHandling: function() {
    this.$(document).on(`keyup.${this.get('elementId')}`, (event) => {
      if (event.keyCode === LEFT_ARROW_KEY) { this.get('controller').send('previous'); }
      if (event.keyCode === RIGHT_ARROW_KEY) { this.get('controller').send('next'); }
    });
  }.on('didInsertElement'),

  removeArrowKeysHandling: function() {
    this.$(document).off(`keyup.${this.get('elementId')}`);
  }.on('willDestroyElement')
});
