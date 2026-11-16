/** Close top-layer dialogs, including those owned by nested Lit components. */
export function dismissDialogs(root: ParentNode): void {
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot) dismissDialogs(element.shadowRoot);
    if (element instanceof HTMLDialogElement && element.open) element.close('cancel');
  }
}
