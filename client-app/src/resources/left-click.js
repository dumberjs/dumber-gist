// handle primary button click or a touch
function handleLeftClickEvent(event) {
  // mouse event primary button is 0,
  // touch event button is undefined.
  if (event.button) return;
  // only call real callback when it is either left mouse click or touch event.
  this.leftClickEventCallSource(event);
}

export class LeftClickBindingBehavior {
  bind(binding) {
    if (!binding.callSource || !binding.targetEvent) throw new Error('leftClick binding behavior only supports event.');
    binding.leftClickEventCallSource = binding.callSource;
    binding.callSource = handleLeftClickEvent;
  }

  unbind(binding) {
    binding.callSource = binding.leftClickEventCallSource;
    binding.leftClickEventCallSource = null;
  }
}
