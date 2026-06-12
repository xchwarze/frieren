var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var xterm = { exports: {} };
var hasRequiredXterm;
function requireXterm() {
  if (hasRequiredXterm) return xterm.exports;
  hasRequiredXterm = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(globalThis, (() => (() => {
      var e2 = { 4567: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.AccessibilityManager = void 0;
        const n2 = i3(9042), o2 = i3(9924), a2 = i3(844), h2 = i3(4725), c2 = i3(2585), l2 = i3(3656);
        let d2 = t3.AccessibilityManager = class extends a2.Disposable {
          constructor(e4, t4, i4, s4) {
            super(), this._terminal = e4, this._coreBrowserService = i4, this._renderService = s4, this._rowColumns = /* @__PURE__ */ new WeakMap(), this._liveRegionLineCount = 0, this._charsToConsume = [], this._charsToAnnounce = "", this._accessibilityContainer = this._coreBrowserService.mainDocument.createElement("div"), this._accessibilityContainer.classList.add("xterm-accessibility"), this._rowContainer = this._coreBrowserService.mainDocument.createElement("div"), this._rowContainer.setAttribute("role", "list"), this._rowContainer.classList.add("xterm-accessibility-tree"), this._rowElements = [];
            for (let e5 = 0; e5 < this._terminal.rows; e5++) this._rowElements[e5] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e5]);
            if (this._topBoundaryFocusListener = (e5) => this._handleBoundaryFocus(e5, 0), this._bottomBoundaryFocusListener = (e5) => this._handleBoundaryFocus(e5, 1), this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions(), this._accessibilityContainer.appendChild(this._rowContainer), this._liveRegion = this._coreBrowserService.mainDocument.createElement("div"), this._liveRegion.classList.add("live-region"), this._liveRegion.setAttribute("aria-live", "assertive"), this._accessibilityContainer.appendChild(this._liveRegion), this._liveRegionDebouncer = this.register(new o2.TimeBasedDebouncer(this._renderRows.bind(this))), !this._terminal.element) throw new Error("Cannot enable accessibility before Terminal.open");
            this._terminal.element.insertAdjacentElement("afterbegin", this._accessibilityContainer), this.register(this._terminal.onResize(((e5) => this._handleResize(e5.rows)))), this.register(this._terminal.onRender(((e5) => this._refreshRows(e5.start, e5.end)))), this.register(this._terminal.onScroll((() => this._refreshRows()))), this.register(this._terminal.onA11yChar(((e5) => this._handleChar(e5)))), this.register(this._terminal.onLineFeed((() => this._handleChar("\n")))), this.register(this._terminal.onA11yTab(((e5) => this._handleTab(e5)))), this.register(this._terminal.onKey(((e5) => this._handleKey(e5.key)))), this.register(this._terminal.onBlur((() => this._clearLiveRegion()))), this.register(this._renderService.onDimensionsChange((() => this._refreshRowsDimensions()))), this.register((0, l2.addDisposableDomListener)(document, "selectionchange", (() => this._handleSelectionChange()))), this.register(this._coreBrowserService.onDprChange((() => this._refreshRowsDimensions()))), this._refreshRows(), this.register((0, a2.toDisposable)((() => {
              this._accessibilityContainer.remove(), this._rowElements.length = 0;
            })));
          }
          _handleTab(e4) {
            for (let t4 = 0; t4 < e4; t4++) this._handleChar(" ");
          }
          _handleChar(e4) {
            this._liveRegionLineCount < 21 && (this._charsToConsume.length > 0 ? this._charsToConsume.shift() !== e4 && (this._charsToAnnounce += e4) : this._charsToAnnounce += e4, "\n" === e4 && (this._liveRegionLineCount++, 21 === this._liveRegionLineCount && (this._liveRegion.textContent += n2.tooMuchOutput)));
          }
          _clearLiveRegion() {
            this._liveRegion.textContent = "", this._liveRegionLineCount = 0;
          }
          _handleKey(e4) {
            this._clearLiveRegion(), new RegExp("\\p{Control}", "u").test(e4) || this._charsToConsume.push(e4);
          }
          _refreshRows(e4, t4) {
            this._liveRegionDebouncer.refresh(e4, t4, this._terminal.rows);
          }
          _renderRows(e4, t4) {
            const i4 = this._terminal.buffer, s4 = i4.lines.length.toString();
            for (let r3 = e4; r3 <= t4; r3++) {
              const e5 = i4.lines.get(i4.ydisp + r3), t5 = [], n3 = e5?.translateToString(true, void 0, void 0, t5) || "", o3 = (i4.ydisp + r3 + 1).toString(), a3 = this._rowElements[r3];
              a3 && (0 === n3.length ? (a3.innerText = " ", this._rowColumns.set(a3, [0, 1])) : (a3.textContent = n3, this._rowColumns.set(a3, t5)), a3.setAttribute("aria-posinset", o3), a3.setAttribute("aria-setsize", s4));
            }
            this._announceCharacters();
          }
          _announceCharacters() {
            0 !== this._charsToAnnounce.length && (this._liveRegion.textContent += this._charsToAnnounce, this._charsToAnnounce = "");
          }
          _handleBoundaryFocus(e4, t4) {
            const i4 = e4.target, s4 = this._rowElements[0 === t4 ? 1 : this._rowElements.length - 2];
            if (i4.getAttribute("aria-posinset") === (0 === t4 ? "1" : `${this._terminal.buffer.lines.length}`)) return;
            if (e4.relatedTarget !== s4) return;
            let r3, n3;
            if (0 === t4 ? (r3 = i4, n3 = this._rowElements.pop(), this._rowContainer.removeChild(n3)) : (r3 = this._rowElements.shift(), n3 = i4, this._rowContainer.removeChild(r3)), r3.removeEventListener("focus", this._topBoundaryFocusListener), n3.removeEventListener("focus", this._bottomBoundaryFocusListener), 0 === t4) {
              const e5 = this._createAccessibilityTreeNode();
              this._rowElements.unshift(e5), this._rowContainer.insertAdjacentElement("afterbegin", e5);
            } else {
              const e5 = this._createAccessibilityTreeNode();
              this._rowElements.push(e5), this._rowContainer.appendChild(e5);
            }
            this._rowElements[0].addEventListener("focus", this._topBoundaryFocusListener), this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._terminal.scrollLines(0 === t4 ? -1 : 1), this._rowElements[0 === t4 ? 1 : this._rowElements.length - 2].focus(), e4.preventDefault(), e4.stopImmediatePropagation();
          }
          _handleSelectionChange() {
            if (0 === this._rowElements.length) return;
            const e4 = document.getSelection();
            if (!e4) return;
            if (e4.isCollapsed) return void (this._rowContainer.contains(e4.anchorNode) && this._terminal.clearSelection());
            if (!e4.anchorNode || !e4.focusNode) return void console.error("anchorNode and/or focusNode are null");
            let t4 = { node: e4.anchorNode, offset: e4.anchorOffset }, i4 = { node: e4.focusNode, offset: e4.focusOffset };
            if ((t4.node.compareDocumentPosition(i4.node) & Node.DOCUMENT_POSITION_PRECEDING || t4.node === i4.node && t4.offset > i4.offset) && ([t4, i4] = [i4, t4]), t4.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING) && (t4 = { node: this._rowElements[0].childNodes[0], offset: 0 }), !this._rowContainer.contains(t4.node)) return;
            const s4 = this._rowElements.slice(-1)[0];
            if (i4.node.compareDocumentPosition(s4) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING) && (i4 = { node: s4, offset: s4.textContent?.length ?? 0 }), !this._rowContainer.contains(i4.node)) return;
            const r3 = ({ node: e5, offset: t5 }) => {
              const i5 = e5 instanceof Text ? e5.parentNode : e5;
              let s5 = parseInt(i5?.getAttribute("aria-posinset"), 10) - 1;
              if (isNaN(s5)) return console.warn("row is invalid. Race condition?"), null;
              const r4 = this._rowColumns.get(i5);
              if (!r4) return console.warn("columns is null. Race condition?"), null;
              let n4 = t5 < r4.length ? r4[t5] : r4.slice(-1)[0] + 1;
              return n4 >= this._terminal.cols && (++s5, n4 = 0), { row: s5, column: n4 };
            }, n3 = r3(t4), o3 = r3(i4);
            if (n3 && o3) {
              if (n3.row > o3.row || n3.row === o3.row && n3.column >= o3.column) throw new Error("invalid range");
              this._terminal.select(n3.column, n3.row, (o3.row - n3.row) * this._terminal.cols - n3.column + o3.column);
            }
          }
          _handleResize(e4) {
            this._rowElements[this._rowElements.length - 1].removeEventListener("focus", this._bottomBoundaryFocusListener);
            for (let e5 = this._rowContainer.children.length; e5 < this._terminal.rows; e5++) this._rowElements[e5] = this._createAccessibilityTreeNode(), this._rowContainer.appendChild(this._rowElements[e5]);
            for (; this._rowElements.length > e4; ) this._rowContainer.removeChild(this._rowElements.pop());
            this._rowElements[this._rowElements.length - 1].addEventListener("focus", this._bottomBoundaryFocusListener), this._refreshRowsDimensions();
          }
          _createAccessibilityTreeNode() {
            const e4 = this._coreBrowserService.mainDocument.createElement("div");
            return e4.setAttribute("role", "listitem"), e4.tabIndex = -1, this._refreshRowDimensions(e4), e4;
          }
          _refreshRowsDimensions() {
            if (this._renderService.dimensions.css.cell.height) {
              this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`, this._rowElements.length !== this._terminal.rows && this._handleResize(this._terminal.rows);
              for (let e4 = 0; e4 < this._terminal.rows; e4++) this._refreshRowDimensions(this._rowElements[e4]);
            }
          }
          _refreshRowDimensions(e4) {
            e4.style.height = `${this._renderService.dimensions.css.cell.height}px`;
          }
        };
        t3.AccessibilityManager = d2 = s3([r2(1, c2.IInstantiationService), r2(2, h2.ICoreBrowserService), r2(3, h2.IRenderService)], d2);
      }, 3614: (e3, t3) => {
        function i3(e4) {
          return e4.replace(/\r?\n/g, "\r");
        }
        function s3(e4, t4) {
          return t4 ? "\x1B[200~" + e4 + "\x1B[201~" : e4;
        }
        function r2(e4, t4, r3, n3) {
          e4 = s3(e4 = i3(e4), r3.decPrivateModes.bracketedPasteMode && true !== n3.rawOptions.ignoreBracketedPasteMode), r3.triggerDataEvent(e4, true), t4.value = "";
        }
        function n2(e4, t4, i4) {
          const s4 = i4.getBoundingClientRect(), r3 = e4.clientX - s4.left - 10, n3 = e4.clientY - s4.top - 10;
          t4.style.width = "20px", t4.style.height = "20px", t4.style.left = `${r3}px`, t4.style.top = `${n3}px`, t4.style.zIndex = "1000", t4.focus();
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.rightClickHandler = t3.moveTextAreaUnderMouseCursor = t3.paste = t3.handlePasteEvent = t3.copyHandler = t3.bracketTextForPaste = t3.prepareTextForTerminal = void 0, t3.prepareTextForTerminal = i3, t3.bracketTextForPaste = s3, t3.copyHandler = function(e4, t4) {
          e4.clipboardData && e4.clipboardData.setData("text/plain", t4.selectionText), e4.preventDefault();
        }, t3.handlePasteEvent = function(e4, t4, i4, s4) {
          e4.stopPropagation(), e4.clipboardData && r2(e4.clipboardData.getData("text/plain"), t4, i4, s4);
        }, t3.paste = r2, t3.moveTextAreaUnderMouseCursor = n2, t3.rightClickHandler = function(e4, t4, i4, s4, r3) {
          n2(e4, t4, i4), r3 && s4.rightClickSelect(e4), t4.value = s4.selectionText, t4.select();
        };
      }, 7239: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ColorContrastCache = void 0;
        const s3 = i3(1505);
        t3.ColorContrastCache = class {
          constructor() {
            this._color = new s3.TwoKeyMap(), this._css = new s3.TwoKeyMap();
          }
          setCss(e4, t4, i4) {
            this._css.set(e4, t4, i4);
          }
          getCss(e4, t4) {
            return this._css.get(e4, t4);
          }
          setColor(e4, t4, i4) {
            this._color.set(e4, t4, i4);
          }
          getColor(e4, t4) {
            return this._color.get(e4, t4);
          }
          clear() {
            this._color.clear(), this._css.clear();
          }
        };
      }, 3656: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.addDisposableDomListener = void 0, t3.addDisposableDomListener = function(e4, t4, i3, s3) {
          e4.addEventListener(t4, i3, s3);
          let r2 = false;
          return { dispose: () => {
            r2 || (r2 = true, e4.removeEventListener(t4, i3, s3));
          } };
        };
      }, 3551: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Linkifier = void 0;
        const n2 = i3(3656), o2 = i3(8460), a2 = i3(844), h2 = i3(2585), c2 = i3(4725);
        let l2 = t3.Linkifier = class extends a2.Disposable {
          get currentLink() {
            return this._currentLink;
          }
          constructor(e4, t4, i4, s4, r3) {
            super(), this._element = e4, this._mouseService = t4, this._renderService = i4, this._bufferService = s4, this._linkProviderService = r3, this._linkCacheDisposables = [], this._isMouseOut = true, this._wasResized = false, this._activeLine = -1, this._onShowLinkUnderline = this.register(new o2.EventEmitter()), this.onShowLinkUnderline = this._onShowLinkUnderline.event, this._onHideLinkUnderline = this.register(new o2.EventEmitter()), this.onHideLinkUnderline = this._onHideLinkUnderline.event, this.register((0, a2.getDisposeArrayDisposable)(this._linkCacheDisposables)), this.register((0, a2.toDisposable)((() => {
              this._lastMouseEvent = void 0, this._activeProviderReplies?.clear();
            }))), this.register(this._bufferService.onResize((() => {
              this._clearCurrentLink(), this._wasResized = true;
            }))), this.register((0, n2.addDisposableDomListener)(this._element, "mouseleave", (() => {
              this._isMouseOut = true, this._clearCurrentLink();
            }))), this.register((0, n2.addDisposableDomListener)(this._element, "mousemove", this._handleMouseMove.bind(this))), this.register((0, n2.addDisposableDomListener)(this._element, "mousedown", this._handleMouseDown.bind(this))), this.register((0, n2.addDisposableDomListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
          }
          _handleMouseMove(e4) {
            this._lastMouseEvent = e4;
            const t4 = this._positionFromMouseEvent(e4, this._element, this._mouseService);
            if (!t4) return;
            this._isMouseOut = false;
            const i4 = e4.composedPath();
            for (let e5 = 0; e5 < i4.length; e5++) {
              const t5 = i4[e5];
              if (t5.classList.contains("xterm")) break;
              if (t5.classList.contains("xterm-hover")) return;
            }
            this._lastBufferCell && t4.x === this._lastBufferCell.x && t4.y === this._lastBufferCell.y || (this._handleHover(t4), this._lastBufferCell = t4);
          }
          _handleHover(e4) {
            if (this._activeLine !== e4.y || this._wasResized) return this._clearCurrentLink(), this._askForLink(e4, false), void (this._wasResized = false);
            this._currentLink && this._linkAtPosition(this._currentLink.link, e4) || (this._clearCurrentLink(), this._askForLink(e4, true));
          }
          _askForLink(e4, t4) {
            this._activeProviderReplies && t4 || (this._activeProviderReplies?.forEach(((e5) => {
              e5?.forEach(((e6) => {
                e6.link.dispose && e6.link.dispose();
              }));
            })), this._activeProviderReplies = /* @__PURE__ */ new Map(), this._activeLine = e4.y);
            let i4 = false;
            for (const [s4, r3] of this._linkProviderService.linkProviders.entries()) if (t4) {
              const t5 = this._activeProviderReplies?.get(s4);
              t5 && (i4 = this._checkLinkProviderResult(s4, e4, i4));
            } else r3.provideLinks(e4.y, ((t5) => {
              if (this._isMouseOut) return;
              const r4 = t5?.map(((e5) => ({ link: e5 })));
              this._activeProviderReplies?.set(s4, r4), i4 = this._checkLinkProviderResult(s4, e4, i4), this._activeProviderReplies?.size === this._linkProviderService.linkProviders.length && this._removeIntersectingLinks(e4.y, this._activeProviderReplies);
            }));
          }
          _removeIntersectingLinks(e4, t4) {
            const i4 = /* @__PURE__ */ new Set();
            for (let s4 = 0; s4 < t4.size; s4++) {
              const r3 = t4.get(s4);
              if (r3) for (let t5 = 0; t5 < r3.length; t5++) {
                const s5 = r3[t5], n3 = s5.link.range.start.y < e4 ? 0 : s5.link.range.start.x, o3 = s5.link.range.end.y > e4 ? this._bufferService.cols : s5.link.range.end.x;
                for (let e5 = n3; e5 <= o3; e5++) {
                  if (i4.has(e5)) {
                    r3.splice(t5--, 1);
                    break;
                  }
                  i4.add(e5);
                }
              }
            }
          }
          _checkLinkProviderResult(e4, t4, i4) {
            if (!this._activeProviderReplies) return i4;
            const s4 = this._activeProviderReplies.get(e4);
            let r3 = false;
            for (let t5 = 0; t5 < e4; t5++) this._activeProviderReplies.has(t5) && !this._activeProviderReplies.get(t5) || (r3 = true);
            if (!r3 && s4) {
              const e5 = s4.find(((e6) => this._linkAtPosition(e6.link, t4)));
              e5 && (i4 = true, this._handleNewLink(e5));
            }
            if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !i4) for (let e5 = 0; e5 < this._activeProviderReplies.size; e5++) {
              const s5 = this._activeProviderReplies.get(e5)?.find(((e6) => this._linkAtPosition(e6.link, t4)));
              if (s5) {
                i4 = true, this._handleNewLink(s5);
                break;
              }
            }
            return i4;
          }
          _handleMouseDown() {
            this._mouseDownLink = this._currentLink;
          }
          _handleMouseUp(e4) {
            if (!this._currentLink) return;
            const t4 = this._positionFromMouseEvent(e4, this._element, this._mouseService);
            t4 && this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, t4) && this._currentLink.link.activate(e4, this._currentLink.link.text);
          }
          _clearCurrentLink(e4, t4) {
            this._currentLink && this._lastMouseEvent && (!e4 || !t4 || this._currentLink.link.range.start.y >= e4 && this._currentLink.link.range.end.y <= t4) && (this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent), this._currentLink = void 0, (0, a2.disposeArray)(this._linkCacheDisposables));
          }
          _handleNewLink(e4) {
            if (!this._lastMouseEvent) return;
            const t4 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
            t4 && this._linkAtPosition(e4.link, t4) && (this._currentLink = e4, this._currentLink.state = { decorations: { underline: void 0 === e4.link.decorations || e4.link.decorations.underline, pointerCursor: void 0 === e4.link.decorations || e4.link.decorations.pointerCursor }, isHovered: true }, this._linkHover(this._element, e4.link, this._lastMouseEvent), e4.link.decorations = {}, Object.defineProperties(e4.link.decorations, { pointerCursor: { get: () => this._currentLink?.state?.decorations.pointerCursor, set: (e5) => {
              this._currentLink?.state && this._currentLink.state.decorations.pointerCursor !== e5 && (this._currentLink.state.decorations.pointerCursor = e5, this._currentLink.state.isHovered && this._element.classList.toggle("xterm-cursor-pointer", e5));
            } }, underline: { get: () => this._currentLink?.state?.decorations.underline, set: (t5) => {
              this._currentLink?.state && this._currentLink?.state?.decorations.underline !== t5 && (this._currentLink.state.decorations.underline = t5, this._currentLink.state.isHovered && this._fireUnderlineEvent(e4.link, t5));
            } } }), this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange(((e5) => {
              if (!this._currentLink) return;
              const t5 = 0 === e5.start ? 0 : e5.start + 1 + this._bufferService.buffer.ydisp, i4 = this._bufferService.buffer.ydisp + 1 + e5.end;
              if (this._currentLink.link.range.start.y >= t5 && this._currentLink.link.range.end.y <= i4 && (this._clearCurrentLink(t5, i4), this._lastMouseEvent)) {
                const e6 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
                e6 && this._askForLink(e6, false);
              }
            }))));
          }
          _linkHover(e4, t4, i4) {
            this._currentLink?.state && (this._currentLink.state.isHovered = true, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t4, true), this._currentLink.state.decorations.pointerCursor && e4.classList.add("xterm-cursor-pointer")), t4.hover && t4.hover(i4, t4.text);
          }
          _fireUnderlineEvent(e4, t4) {
            const i4 = e4.range, s4 = this._bufferService.buffer.ydisp, r3 = this._createLinkUnderlineEvent(i4.start.x - 1, i4.start.y - s4 - 1, i4.end.x, i4.end.y - s4 - 1, void 0);
            (t4 ? this._onShowLinkUnderline : this._onHideLinkUnderline).fire(r3);
          }
          _linkLeave(e4, t4, i4) {
            this._currentLink?.state && (this._currentLink.state.isHovered = false, this._currentLink.state.decorations.underline && this._fireUnderlineEvent(t4, false), this._currentLink.state.decorations.pointerCursor && e4.classList.remove("xterm-cursor-pointer")), t4.leave && t4.leave(i4, t4.text);
          }
          _linkAtPosition(e4, t4) {
            const i4 = e4.range.start.y * this._bufferService.cols + e4.range.start.x, s4 = e4.range.end.y * this._bufferService.cols + e4.range.end.x, r3 = t4.y * this._bufferService.cols + t4.x;
            return i4 <= r3 && r3 <= s4;
          }
          _positionFromMouseEvent(e4, t4, i4) {
            const s4 = i4.getCoords(e4, t4, this._bufferService.cols, this._bufferService.rows);
            if (s4) return { x: s4[0], y: s4[1] + this._bufferService.buffer.ydisp };
          }
          _createLinkUnderlineEvent(e4, t4, i4, s4, r3) {
            return { x1: e4, y1: t4, x2: i4, y2: s4, cols: this._bufferService.cols, fg: r3 };
          }
        };
        t3.Linkifier = l2 = s3([r2(1, c2.IMouseService), r2(2, c2.IRenderService), r2(3, h2.IBufferService), r2(4, c2.ILinkProviderService)], l2);
      }, 9042: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.tooMuchOutput = t3.promptLabel = void 0, t3.promptLabel = "Terminal input", t3.tooMuchOutput = "Too much output to announce, navigate to rows manually to read";
      }, 3730: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.OscLinkProvider = void 0;
        const n2 = i3(511), o2 = i3(2585);
        let a2 = t3.OscLinkProvider = class {
          constructor(e4, t4, i4) {
            this._bufferService = e4, this._optionsService = t4, this._oscLinkService = i4;
          }
          provideLinks(e4, t4) {
            const i4 = this._bufferService.buffer.lines.get(e4 - 1);
            if (!i4) return void t4(void 0);
            const s4 = [], r3 = this._optionsService.rawOptions.linkHandler, o3 = new n2.CellData(), a3 = i4.getTrimmedLength();
            let c2 = -1, l2 = -1, d2 = false;
            for (let t5 = 0; t5 < a3; t5++) if (-1 !== l2 || i4.hasContent(t5)) {
              if (i4.loadCell(t5, o3), o3.hasExtendedAttrs() && o3.extended.urlId) {
                if (-1 === l2) {
                  l2 = t5, c2 = o3.extended.urlId;
                  continue;
                }
                d2 = o3.extended.urlId !== c2;
              } else -1 !== l2 && (d2 = true);
              if (d2 || -1 !== l2 && t5 === a3 - 1) {
                const i5 = this._oscLinkService.getLinkData(c2)?.uri;
                if (i5) {
                  const n3 = { start: { x: l2 + 1, y: e4 }, end: { x: t5 + (d2 || t5 !== a3 - 1 ? 0 : 1), y: e4 } };
                  let o4 = false;
                  if (!r3?.allowNonHttpProtocols) try {
                    const e5 = new URL(i5);
                    ["http:", "https:"].includes(e5.protocol) || (o4 = true);
                  } catch (e5) {
                    o4 = true;
                  }
                  o4 || s4.push({ text: i5, range: n3, activate: (e5, t6) => r3 ? r3.activate(e5, t6, n3) : h2(0, t6), hover: (e5, t6) => r3?.hover?.(e5, t6, n3), leave: (e5, t6) => r3?.leave?.(e5, t6, n3) });
                }
                d2 = false, o3.hasExtendedAttrs() && o3.extended.urlId ? (l2 = t5, c2 = o3.extended.urlId) : (l2 = -1, c2 = -1);
              }
            }
            t4(s4);
          }
        };
        function h2(e4, t4) {
          if (confirm(`Do you want to navigate to ${t4}?

WARNING: This link could potentially be dangerous`)) {
            const e5 = window.open();
            if (e5) {
              try {
                e5.opener = null;
              } catch {
              }
              e5.location.href = t4;
            } else console.warn("Opening link blocked as opener could not be cleared");
          }
        }
        t3.OscLinkProvider = a2 = s3([r2(0, o2.IBufferService), r2(1, o2.IOptionsService), r2(2, o2.IOscLinkService)], a2);
      }, 6193: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.RenderDebouncer = void 0, t3.RenderDebouncer = class {
          constructor(e4, t4) {
            this._renderCallback = e4, this._coreBrowserService = t4, this._refreshCallbacks = [];
          }
          dispose() {
            this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          addRefreshCallback(e4) {
            return this._refreshCallbacks.push(e4), this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh()))), this._animationFrame;
          }
          refresh(e4, t4, i3) {
            this._rowCount = i3, e4 = void 0 !== e4 ? e4 : 0, t4 = void 0 !== t4 ? t4 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e4) : e4, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t4) : t4, this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh())));
          }
          _innerRefresh() {
            if (this._animationFrame = void 0, void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return void this._runRefreshCallbacks();
            const e4 = Math.max(this._rowStart, 0), t4 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e4, t4), this._runRefreshCallbacks();
          }
          _runRefreshCallbacks() {
            for (const e4 of this._refreshCallbacks) e4(0);
            this._refreshCallbacks = [];
          }
        };
      }, 3236: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Terminal = void 0;
        const s3 = i3(3614), r2 = i3(3656), n2 = i3(3551), o2 = i3(9042), a2 = i3(3730), h2 = i3(1680), c2 = i3(3107), l2 = i3(5744), d2 = i3(2950), _2 = i3(1296), u2 = i3(428), f2 = i3(4269), v2 = i3(5114), p2 = i3(8934), g2 = i3(3230), m2 = i3(9312), S2 = i3(4725), C2 = i3(6731), b2 = i3(8055), w2 = i3(8969), y2 = i3(8460), E2 = i3(844), k2 = i3(6114), L2 = i3(8437), D2 = i3(2584), R2 = i3(7399), x2 = i3(5941), A2 = i3(9074), B2 = i3(2585), T2 = i3(5435), M2 = i3(4567), O2 = i3(779);
        class P2 extends w2.CoreTerminal {
          get onFocus() {
            return this._onFocus.event;
          }
          get onBlur() {
            return this._onBlur.event;
          }
          get onA11yChar() {
            return this._onA11yCharEmitter.event;
          }
          get onA11yTab() {
            return this._onA11yTabEmitter.event;
          }
          get onWillOpen() {
            return this._onWillOpen.event;
          }
          constructor(e4 = {}) {
            super(e4), this.browser = k2, this._keyDownHandled = false, this._keyDownSeen = false, this._keyPressHandled = false, this._unprocessedDeadKey = false, this._accessibilityManager = this.register(new E2.MutableDisposable()), this._onCursorMove = this.register(new y2.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onKey = this.register(new y2.EventEmitter()), this.onKey = this._onKey.event, this._onRender = this.register(new y2.EventEmitter()), this.onRender = this._onRender.event, this._onSelectionChange = this.register(new y2.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onTitleChange = this.register(new y2.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onBell = this.register(new y2.EventEmitter()), this.onBell = this._onBell.event, this._onFocus = this.register(new y2.EventEmitter()), this._onBlur = this.register(new y2.EventEmitter()), this._onA11yCharEmitter = this.register(new y2.EventEmitter()), this._onA11yTabEmitter = this.register(new y2.EventEmitter()), this._onWillOpen = this.register(new y2.EventEmitter()), this._setup(), this._decorationService = this._instantiationService.createInstance(A2.DecorationService), this._instantiationService.setService(B2.IDecorationService, this._decorationService), this._linkProviderService = this._instantiationService.createInstance(O2.LinkProviderService), this._instantiationService.setService(S2.ILinkProviderService, this._linkProviderService), this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(a2.OscLinkProvider)), this.register(this._inputHandler.onRequestBell((() => this._onBell.fire()))), this.register(this._inputHandler.onRequestRefreshRows(((e5, t4) => this.refresh(e5, t4)))), this.register(this._inputHandler.onRequestSendFocus((() => this._reportFocus()))), this.register(this._inputHandler.onRequestReset((() => this.reset()))), this.register(this._inputHandler.onRequestWindowsOptionsReport(((e5) => this._reportWindowsOptions(e5)))), this.register(this._inputHandler.onColor(((e5) => this._handleColorEvent(e5)))), this.register((0, y2.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove)), this.register((0, y2.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange)), this.register((0, y2.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter)), this.register((0, y2.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter)), this.register(this._bufferService.onResize(((e5) => this._afterResize(e5.cols, e5.rows)))), this.register((0, E2.toDisposable)((() => {
              this._customKeyEventHandler = void 0, this.element?.parentNode?.removeChild(this.element);
            })));
          }
          _handleColorEvent(e4) {
            if (this._themeService) for (const t4 of e4) {
              let e5, i4 = "";
              switch (t4.index) {
                case 256:
                  e5 = "foreground", i4 = "10";
                  break;
                case 257:
                  e5 = "background", i4 = "11";
                  break;
                case 258:
                  e5 = "cursor", i4 = "12";
                  break;
                default:
                  e5 = "ansi", i4 = "4;" + t4.index;
              }
              switch (t4.type) {
                case 0:
                  const s4 = b2.color.toColorRGB("ansi" === e5 ? this._themeService.colors.ansi[t4.index] : this._themeService.colors[e5]);
                  this.coreService.triggerDataEvent(`${D2.C0.ESC}]${i4};${(0, x2.toRgbString)(s4)}${D2.C1_ESCAPED.ST}`);
                  break;
                case 1:
                  if ("ansi" === e5) this._themeService.modifyColors(((e6) => e6.ansi[t4.index] = b2.channels.toColor(...t4.color)));
                  else {
                    const i5 = e5;
                    this._themeService.modifyColors(((e6) => e6[i5] = b2.channels.toColor(...t4.color)));
                  }
                  break;
                case 2:
                  this._themeService.restoreColor(t4.index);
              }
            }
          }
          _setup() {
            super._setup(), this._customKeyEventHandler = void 0;
          }
          get buffer() {
            return this.buffers.active;
          }
          focus() {
            this.textarea && this.textarea.focus({ preventScroll: true });
          }
          _handleScreenReaderModeOptionChange(e4) {
            e4 ? !this._accessibilityManager.value && this._renderService && (this._accessibilityManager.value = this._instantiationService.createInstance(M2.AccessibilityManager, this)) : this._accessibilityManager.clear();
          }
          _handleTextAreaFocus(e4) {
            this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D2.C0.ESC + "[I"), this.element.classList.add("focus"), this._showCursor(), this._onFocus.fire();
          }
          blur() {
            return this.textarea?.blur();
          }
          _handleTextAreaBlur() {
            this.textarea.value = "", this.refresh(this.buffer.y, this.buffer.y), this.coreService.decPrivateModes.sendFocus && this.coreService.triggerDataEvent(D2.C0.ESC + "[O"), this.element.classList.remove("focus"), this._onBlur.fire();
          }
          _syncTextArea() {
            if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) return;
            const e4 = this.buffer.ybase + this.buffer.y, t4 = this.buffer.lines.get(e4);
            if (!t4) return;
            const i4 = Math.min(this.buffer.x, this.cols - 1), s4 = this._renderService.dimensions.css.cell.height, r3 = t4.getWidth(i4), n3 = this._renderService.dimensions.css.cell.width * r3, o3 = this.buffer.y * this._renderService.dimensions.css.cell.height, a3 = i4 * this._renderService.dimensions.css.cell.width;
            this.textarea.style.left = a3 + "px", this.textarea.style.top = o3 + "px", this.textarea.style.width = n3 + "px", this.textarea.style.height = s4 + "px", this.textarea.style.lineHeight = s4 + "px", this.textarea.style.zIndex = "-5";
          }
          _initGlobal() {
            this._bindKeys(), this.register((0, r2.addDisposableDomListener)(this.element, "copy", ((e5) => {
              this.hasSelection() && (0, s3.copyHandler)(e5, this._selectionService);
            })));
            const e4 = (e5) => (0, s3.handlePasteEvent)(e5, this.textarea, this.coreService, this.optionsService);
            this.register((0, r2.addDisposableDomListener)(this.textarea, "paste", e4)), this.register((0, r2.addDisposableDomListener)(this.element, "paste", e4)), k2.isFirefox ? this.register((0, r2.addDisposableDomListener)(this.element, "mousedown", ((e5) => {
              2 === e5.button && (0, s3.rightClickHandler)(e5, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            }))) : this.register((0, r2.addDisposableDomListener)(this.element, "contextmenu", ((e5) => {
              (0, s3.rightClickHandler)(e5, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            }))), k2.isLinux && this.register((0, r2.addDisposableDomListener)(this.element, "auxclick", ((e5) => {
              1 === e5.button && (0, s3.moveTextAreaUnderMouseCursor)(e5, this.textarea, this.screenElement);
            })));
          }
          _bindKeys() {
            this.register((0, r2.addDisposableDomListener)(this.textarea, "keyup", ((e4) => this._keyUp(e4)), true)), this.register((0, r2.addDisposableDomListener)(this.textarea, "keydown", ((e4) => this._keyDown(e4)), true)), this.register((0, r2.addDisposableDomListener)(this.textarea, "keypress", ((e4) => this._keyPress(e4)), true)), this.register((0, r2.addDisposableDomListener)(this.textarea, "compositionstart", (() => this._compositionHelper.compositionstart()))), this.register((0, r2.addDisposableDomListener)(this.textarea, "compositionupdate", ((e4) => this._compositionHelper.compositionupdate(e4)))), this.register((0, r2.addDisposableDomListener)(this.textarea, "compositionend", (() => this._compositionHelper.compositionend()))), this.register((0, r2.addDisposableDomListener)(this.textarea, "input", ((e4) => this._inputEvent(e4)), true)), this.register(this.onRender((() => this._compositionHelper.updateCompositionElements())));
          }
          open(e4) {
            if (!e4) throw new Error("Terminal requires a parent element.");
            if (e4.isConnected || this._logService.debug("Terminal.open was called on an element that was not attached to the DOM"), this.element?.ownerDocument.defaultView && this._coreBrowserService) return void (this.element.ownerDocument.defaultView !== this._coreBrowserService.window && (this._coreBrowserService.window = this.element.ownerDocument.defaultView));
            this._document = e4.ownerDocument, this.options.documentOverride && this.options.documentOverride instanceof Document && (this._document = this.optionsService.rawOptions.documentOverride), this.element = this._document.createElement("div"), this.element.dir = "ltr", this.element.classList.add("terminal"), this.element.classList.add("xterm"), e4.appendChild(this.element);
            const t4 = this._document.createDocumentFragment();
            this._viewportElement = this._document.createElement("div"), this._viewportElement.classList.add("xterm-viewport"), t4.appendChild(this._viewportElement), this._viewportScrollArea = this._document.createElement("div"), this._viewportScrollArea.classList.add("xterm-scroll-area"), this._viewportElement.appendChild(this._viewportScrollArea), this.screenElement = this._document.createElement("div"), this.screenElement.classList.add("xterm-screen"), this.register((0, r2.addDisposableDomListener)(this.screenElement, "mousemove", ((e5) => this.updateCursorStyle(e5)))), this._helperContainer = this._document.createElement("div"), this._helperContainer.classList.add("xterm-helpers"), this.screenElement.appendChild(this._helperContainer), t4.appendChild(this.screenElement), this.textarea = this._document.createElement("textarea"), this.textarea.classList.add("xterm-helper-textarea"), this.textarea.setAttribute("aria-label", o2.promptLabel), k2.isChromeOS || this.textarea.setAttribute("aria-multiline", "false"), this.textarea.setAttribute("autocorrect", "off"), this.textarea.setAttribute("autocapitalize", "off"), this.textarea.setAttribute("spellcheck", "false"), this.textarea.tabIndex = 0, this._coreBrowserService = this.register(this._instantiationService.createInstance(v2.CoreBrowserService, this.textarea, e4.ownerDocument.defaultView ?? window, this._document ?? "undefined" != typeof window ? window.document : null)), this._instantiationService.setService(S2.ICoreBrowserService, this._coreBrowserService), this.register((0, r2.addDisposableDomListener)(this.textarea, "focus", ((e5) => this._handleTextAreaFocus(e5)))), this.register((0, r2.addDisposableDomListener)(this.textarea, "blur", (() => this._handleTextAreaBlur()))), this._helperContainer.appendChild(this.textarea), this._charSizeService = this._instantiationService.createInstance(u2.CharSizeService, this._document, this._helperContainer), this._instantiationService.setService(S2.ICharSizeService, this._charSizeService), this._themeService = this._instantiationService.createInstance(C2.ThemeService), this._instantiationService.setService(S2.IThemeService, this._themeService), this._characterJoinerService = this._instantiationService.createInstance(f2.CharacterJoinerService), this._instantiationService.setService(S2.ICharacterJoinerService, this._characterJoinerService), this._renderService = this.register(this._instantiationService.createInstance(g2.RenderService, this.rows, this.screenElement)), this._instantiationService.setService(S2.IRenderService, this._renderService), this.register(this._renderService.onRenderedViewportChange(((e5) => this._onRender.fire(e5)))), this.onResize(((e5) => this._renderService.resize(e5.cols, e5.rows))), this._compositionView = this._document.createElement("div"), this._compositionView.classList.add("composition-view"), this._compositionHelper = this._instantiationService.createInstance(d2.CompositionHelper, this.textarea, this._compositionView), this._helperContainer.appendChild(this._compositionView), this._mouseService = this._instantiationService.createInstance(p2.MouseService), this._instantiationService.setService(S2.IMouseService, this._mouseService), this.linkifier = this.register(this._instantiationService.createInstance(n2.Linkifier, this.screenElement)), this.element.appendChild(t4);
            try {
              this._onWillOpen.fire(this.element);
            } catch {
            }
            this._renderService.hasRenderer() || this._renderService.setRenderer(this._createRenderer()), this.viewport = this._instantiationService.createInstance(h2.Viewport, this._viewportElement, this._viewportScrollArea), this.viewport.onRequestScrollLines(((e5) => this.scrollLines(e5.amount, e5.suppressScrollEvent, 1))), this.register(this._inputHandler.onRequestSyncScrollBar((() => this.viewport.syncScrollArea()))), this.register(this.viewport), this.register(this.onCursorMove((() => {
              this._renderService.handleCursorMove(), this._syncTextArea();
            }))), this.register(this.onResize((() => this._renderService.handleResize(this.cols, this.rows)))), this.register(this.onBlur((() => this._renderService.handleBlur()))), this.register(this.onFocus((() => this._renderService.handleFocus()))), this.register(this._renderService.onDimensionsChange((() => this.viewport.syncScrollArea()))), this._selectionService = this.register(this._instantiationService.createInstance(m2.SelectionService, this.element, this.screenElement, this.linkifier)), this._instantiationService.setService(S2.ISelectionService, this._selectionService), this.register(this._selectionService.onRequestScrollLines(((e5) => this.scrollLines(e5.amount, e5.suppressScrollEvent)))), this.register(this._selectionService.onSelectionChange((() => this._onSelectionChange.fire()))), this.register(this._selectionService.onRequestRedraw(((e5) => this._renderService.handleSelectionChanged(e5.start, e5.end, e5.columnSelectMode)))), this.register(this._selectionService.onLinuxMouseSelection(((e5) => {
              this.textarea.value = e5, this.textarea.focus(), this.textarea.select();
            }))), this.register(this._onScroll.event(((e5) => {
              this.viewport.syncScrollArea(), this._selectionService.refresh();
            }))), this.register((0, r2.addDisposableDomListener)(this._viewportElement, "scroll", (() => this._selectionService.refresh()))), this.register(this._instantiationService.createInstance(c2.BufferDecorationRenderer, this.screenElement)), this.register((0, r2.addDisposableDomListener)(this.element, "mousedown", ((e5) => this._selectionService.handleMouseDown(e5)))), this.coreMouseService.areMouseEventsActive ? (this._selectionService.disable(), this.element.classList.add("enable-mouse-events")) : this._selectionService.enable(), this.options.screenReaderMode && (this._accessibilityManager.value = this._instantiationService.createInstance(M2.AccessibilityManager, this)), this.register(this.optionsService.onSpecificOptionChange("screenReaderMode", ((e5) => this._handleScreenReaderModeOptionChange(e5)))), this.options.overviewRulerWidth && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l2.OverviewRulerRenderer, this._viewportElement, this.screenElement))), this.optionsService.onSpecificOptionChange("overviewRulerWidth", ((e5) => {
              !this._overviewRulerRenderer && e5 && this._viewportElement && this.screenElement && (this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(l2.OverviewRulerRenderer, this._viewportElement, this.screenElement)));
            })), this._charSizeService.measure(), this.refresh(0, this.rows - 1), this._initGlobal(), this.bindMouse();
          }
          _createRenderer() {
            return this._instantiationService.createInstance(_2.DomRenderer, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
          }
          bindMouse() {
            const e4 = this, t4 = this.element;
            function i4(t5) {
              const i5 = e4._mouseService.getMouseReportCoords(t5, e4.screenElement);
              if (!i5) return false;
              let s5, r3;
              switch (t5.overrideType || t5.type) {
                case "mousemove":
                  r3 = 32, void 0 === t5.buttons ? (s5 = 3, void 0 !== t5.button && (s5 = t5.button < 3 ? t5.button : 3)) : s5 = 1 & t5.buttons ? 0 : 4 & t5.buttons ? 1 : 2 & t5.buttons ? 2 : 3;
                  break;
                case "mouseup":
                  r3 = 0, s5 = t5.button < 3 ? t5.button : 3;
                  break;
                case "mousedown":
                  r3 = 1, s5 = t5.button < 3 ? t5.button : 3;
                  break;
                case "wheel":
                  if (e4._customWheelEventHandler && false === e4._customWheelEventHandler(t5)) return false;
                  if (0 === e4.viewport.getLinesScrolled(t5)) return false;
                  r3 = t5.deltaY < 0 ? 0 : 1, s5 = 4;
                  break;
                default:
                  return false;
              }
              return !(void 0 === r3 || void 0 === s5 || s5 > 4) && e4.coreMouseService.triggerMouseEvent({ col: i5.col, row: i5.row, x: i5.x, y: i5.y, button: s5, action: r3, ctrl: t5.ctrlKey, alt: t5.altKey, shift: t5.shiftKey });
            }
            const s4 = { mouseup: null, wheel: null, mousedrag: null, mousemove: null }, n3 = { mouseup: (e5) => (i4(e5), e5.buttons || (this._document.removeEventListener("mouseup", s4.mouseup), s4.mousedrag && this._document.removeEventListener("mousemove", s4.mousedrag)), this.cancel(e5)), wheel: (e5) => (i4(e5), this.cancel(e5, true)), mousedrag: (e5) => {
              e5.buttons && i4(e5);
            }, mousemove: (e5) => {
              e5.buttons || i4(e5);
            } };
            this.register(this.coreMouseService.onProtocolChange(((e5) => {
              e5 ? ("debug" === this.optionsService.rawOptions.logLevel && this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(e5)), this.element.classList.add("enable-mouse-events"), this._selectionService.disable()) : (this._logService.debug("Unbinding from mouse events."), this.element.classList.remove("enable-mouse-events"), this._selectionService.enable()), 8 & e5 ? s4.mousemove || (t4.addEventListener("mousemove", n3.mousemove), s4.mousemove = n3.mousemove) : (t4.removeEventListener("mousemove", s4.mousemove), s4.mousemove = null), 16 & e5 ? s4.wheel || (t4.addEventListener("wheel", n3.wheel, { passive: false }), s4.wheel = n3.wheel) : (t4.removeEventListener("wheel", s4.wheel), s4.wheel = null), 2 & e5 ? s4.mouseup || (s4.mouseup = n3.mouseup) : (this._document.removeEventListener("mouseup", s4.mouseup), s4.mouseup = null), 4 & e5 ? s4.mousedrag || (s4.mousedrag = n3.mousedrag) : (this._document.removeEventListener("mousemove", s4.mousedrag), s4.mousedrag = null);
            }))), this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol, this.register((0, r2.addDisposableDomListener)(t4, "mousedown", ((e5) => {
              if (e5.preventDefault(), this.focus(), this.coreMouseService.areMouseEventsActive && !this._selectionService.shouldForceSelection(e5)) return i4(e5), s4.mouseup && this._document.addEventListener("mouseup", s4.mouseup), s4.mousedrag && this._document.addEventListener("mousemove", s4.mousedrag), this.cancel(e5);
            }))), this.register((0, r2.addDisposableDomListener)(t4, "wheel", ((e5) => {
              if (!s4.wheel) {
                if (this._customWheelEventHandler && false === this._customWheelEventHandler(e5)) return false;
                if (!this.buffer.hasScrollback) {
                  const t5 = this.viewport.getLinesScrolled(e5);
                  if (0 === t5) return;
                  const i5 = D2.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (e5.deltaY < 0 ? "A" : "B");
                  let s5 = "";
                  for (let e6 = 0; e6 < Math.abs(t5); e6++) s5 += i5;
                  return this.coreService.triggerDataEvent(s5, true), this.cancel(e5, true);
                }
                return this.viewport.handleWheel(e5) ? this.cancel(e5) : void 0;
              }
            }), { passive: false })), this.register((0, r2.addDisposableDomListener)(t4, "touchstart", ((e5) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchStart(e5), this.cancel(e5);
            }), { passive: true })), this.register((0, r2.addDisposableDomListener)(t4, "touchmove", ((e5) => {
              if (!this.coreMouseService.areMouseEventsActive) return this.viewport.handleTouchMove(e5) ? void 0 : this.cancel(e5);
            }), { passive: false }));
          }
          refresh(e4, t4) {
            this._renderService?.refreshRows(e4, t4);
          }
          updateCursorStyle(e4) {
            this._selectionService?.shouldColumnSelect(e4) ? this.element.classList.add("column-select") : this.element.classList.remove("column-select");
          }
          _showCursor() {
            this.coreService.isCursorInitialized || (this.coreService.isCursorInitialized = true, this.refresh(this.buffer.y, this.buffer.y));
          }
          scrollLines(e4, t4, i4 = 0) {
            1 === i4 ? (super.scrollLines(e4, t4, i4), this.refresh(0, this.rows - 1)) : this.viewport?.scrollLines(e4);
          }
          paste(e4) {
            (0, s3.paste)(e4, this.textarea, this.coreService, this.optionsService);
          }
          attachCustomKeyEventHandler(e4) {
            this._customKeyEventHandler = e4;
          }
          attachCustomWheelEventHandler(e4) {
            this._customWheelEventHandler = e4;
          }
          registerLinkProvider(e4) {
            return this._linkProviderService.registerLinkProvider(e4);
          }
          registerCharacterJoiner(e4) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            const t4 = this._characterJoinerService.register(e4);
            return this.refresh(0, this.rows - 1), t4;
          }
          deregisterCharacterJoiner(e4) {
            if (!this._characterJoinerService) throw new Error("Terminal must be opened first");
            this._characterJoinerService.deregister(e4) && this.refresh(0, this.rows - 1);
          }
          get markers() {
            return this.buffer.markers;
          }
          registerMarker(e4) {
            return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + e4);
          }
          registerDecoration(e4) {
            return this._decorationService.registerDecoration(e4);
          }
          hasSelection() {
            return !!this._selectionService && this._selectionService.hasSelection;
          }
          select(e4, t4, i4) {
            this._selectionService.setSelection(e4, t4, i4);
          }
          getSelection() {
            return this._selectionService ? this._selectionService.selectionText : "";
          }
          getSelectionPosition() {
            if (this._selectionService && this._selectionService.hasSelection) return { start: { x: this._selectionService.selectionStart[0], y: this._selectionService.selectionStart[1] }, end: { x: this._selectionService.selectionEnd[0], y: this._selectionService.selectionEnd[1] } };
          }
          clearSelection() {
            this._selectionService?.clearSelection();
          }
          selectAll() {
            this._selectionService?.selectAll();
          }
          selectLines(e4, t4) {
            this._selectionService?.selectLines(e4, t4);
          }
          _keyDown(e4) {
            if (this._keyDownHandled = false, this._keyDownSeen = true, this._customKeyEventHandler && false === this._customKeyEventHandler(e4)) return false;
            const t4 = this.browser.isMac && this.options.macOptionIsMeta && e4.altKey;
            if (!t4 && !this._compositionHelper.keydown(e4)) return this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp && this.scrollToBottom(), false;
            t4 || "Dead" !== e4.key && "AltGraph" !== e4.key || (this._unprocessedDeadKey = true);
            const i4 = (0, R2.evaluateKeyboardEvent)(e4, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
            if (this.updateCursorStyle(e4), 3 === i4.type || 2 === i4.type) {
              const t5 = this.rows - 1;
              return this.scrollLines(2 === i4.type ? -t5 : t5), this.cancel(e4, true);
            }
            return 1 === i4.type && this.selectAll(), !!this._isThirdLevelShift(this.browser, e4) || (i4.cancel && this.cancel(e4, true), !i4.key || !!(e4.key && !e4.ctrlKey && !e4.altKey && !e4.metaKey && 1 === e4.key.length && e4.key.charCodeAt(0) >= 65 && e4.key.charCodeAt(0) <= 90) || (this._unprocessedDeadKey ? (this._unprocessedDeadKey = false, true) : (i4.key !== D2.C0.ETX && i4.key !== D2.C0.CR || (this.textarea.value = ""), this._onKey.fire({ key: i4.key, domEvent: e4 }), this._showCursor(), this.coreService.triggerDataEvent(i4.key, true), !this.optionsService.rawOptions.screenReaderMode || e4.altKey || e4.ctrlKey ? this.cancel(e4, true) : void (this._keyDownHandled = true))));
          }
          _isThirdLevelShift(e4, t4) {
            const i4 = e4.isMac && !this.options.macOptionIsMeta && t4.altKey && !t4.ctrlKey && !t4.metaKey || e4.isWindows && t4.altKey && t4.ctrlKey && !t4.metaKey || e4.isWindows && t4.getModifierState("AltGraph");
            return "keypress" === t4.type ? i4 : i4 && (!t4.keyCode || t4.keyCode > 47);
          }
          _keyUp(e4) {
            this._keyDownSeen = false, this._customKeyEventHandler && false === this._customKeyEventHandler(e4) || ((function(e5) {
              return 16 === e5.keyCode || 17 === e5.keyCode || 18 === e5.keyCode;
            })(e4) || this.focus(), this.updateCursorStyle(e4), this._keyPressHandled = false);
          }
          _keyPress(e4) {
            let t4;
            if (this._keyPressHandled = false, this._keyDownHandled) return false;
            if (this._customKeyEventHandler && false === this._customKeyEventHandler(e4)) return false;
            if (this.cancel(e4), e4.charCode) t4 = e4.charCode;
            else if (null === e4.which || void 0 === e4.which) t4 = e4.keyCode;
            else {
              if (0 === e4.which || 0 === e4.charCode) return false;
              t4 = e4.which;
            }
            return !(!t4 || (e4.altKey || e4.ctrlKey || e4.metaKey) && !this._isThirdLevelShift(this.browser, e4) || (t4 = String.fromCharCode(t4), this._onKey.fire({ key: t4, domEvent: e4 }), this._showCursor(), this.coreService.triggerDataEvent(t4, true), this._keyPressHandled = true, this._unprocessedDeadKey = false, 0));
          }
          _inputEvent(e4) {
            if (e4.data && "insertText" === e4.inputType && (!e4.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
              if (this._keyPressHandled) return false;
              this._unprocessedDeadKey = false;
              const t4 = e4.data;
              return this.coreService.triggerDataEvent(t4, true), this.cancel(e4), true;
            }
            return false;
          }
          resize(e4, t4) {
            e4 !== this.cols || t4 !== this.rows ? super.resize(e4, t4) : this._charSizeService && !this._charSizeService.hasValidSize && this._charSizeService.measure();
          }
          _afterResize(e4, t4) {
            this._charSizeService?.measure(), this.viewport?.syncScrollArea(true);
          }
          clear() {
            if (0 !== this.buffer.ybase || 0 !== this.buffer.y) {
              this.buffer.clearAllMarkers(), this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y)), this.buffer.lines.length = 1, this.buffer.ydisp = 0, this.buffer.ybase = 0, this.buffer.y = 0;
              for (let e4 = 1; e4 < this.rows; e4++) this.buffer.lines.push(this.buffer.getBlankLine(L2.DEFAULT_ATTR_DATA));
              this._onScroll.fire({ position: this.buffer.ydisp, source: 0 }), this.viewport?.reset(), this.refresh(0, this.rows - 1);
            }
          }
          reset() {
            this.options.rows = this.rows, this.options.cols = this.cols;
            const e4 = this._customKeyEventHandler;
            this._setup(), super.reset(), this._selectionService?.reset(), this._decorationService.reset(), this.viewport?.reset(), this._customKeyEventHandler = e4, this.refresh(0, this.rows - 1);
          }
          clearTextureAtlas() {
            this._renderService?.clearTextureAtlas();
          }
          _reportFocus() {
            this.element?.classList.contains("focus") ? this.coreService.triggerDataEvent(D2.C0.ESC + "[I") : this.coreService.triggerDataEvent(D2.C0.ESC + "[O");
          }
          _reportWindowsOptions(e4) {
            if (this._renderService) switch (e4) {
              case T2.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                const e5 = this._renderService.dimensions.css.canvas.width.toFixed(0), t4 = this._renderService.dimensions.css.canvas.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D2.C0.ESC}[4;${t4};${e5}t`);
                break;
              case T2.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                const i4 = this._renderService.dimensions.css.cell.width.toFixed(0), s4 = this._renderService.dimensions.css.cell.height.toFixed(0);
                this.coreService.triggerDataEvent(`${D2.C0.ESC}[6;${s4};${i4}t`);
            }
          }
          cancel(e4, t4) {
            if (this.options.cancelEvents || t4) return e4.preventDefault(), e4.stopPropagation(), false;
          }
        }
        t3.Terminal = P2;
      }, 9924: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.TimeBasedDebouncer = void 0, t3.TimeBasedDebouncer = class {
          constructor(e4, t4 = 1e3) {
            this._renderCallback = e4, this._debounceThresholdMS = t4, this._lastRefreshMs = 0, this._additionalRefreshRequested = false;
          }
          dispose() {
            this._refreshTimeoutID && clearTimeout(this._refreshTimeoutID);
          }
          refresh(e4, t4, i3) {
            this._rowCount = i3, e4 = void 0 !== e4 ? e4 : 0, t4 = void 0 !== t4 ? t4 : this._rowCount - 1, this._rowStart = void 0 !== this._rowStart ? Math.min(this._rowStart, e4) : e4, this._rowEnd = void 0 !== this._rowEnd ? Math.max(this._rowEnd, t4) : t4;
            const s3 = Date.now();
            if (s3 - this._lastRefreshMs >= this._debounceThresholdMS) this._lastRefreshMs = s3, this._innerRefresh();
            else if (!this._additionalRefreshRequested) {
              const e5 = s3 - this._lastRefreshMs, t5 = this._debounceThresholdMS - e5;
              this._additionalRefreshRequested = true, this._refreshTimeoutID = window.setTimeout((() => {
                this._lastRefreshMs = Date.now(), this._innerRefresh(), this._additionalRefreshRequested = false, this._refreshTimeoutID = void 0;
              }), t5);
            }
          }
          _innerRefresh() {
            if (void 0 === this._rowStart || void 0 === this._rowEnd || void 0 === this._rowCount) return;
            const e4 = Math.max(this._rowStart, 0), t4 = Math.min(this._rowEnd, this._rowCount - 1);
            this._rowStart = void 0, this._rowEnd = void 0, this._renderCallback(e4, t4);
          }
        };
      }, 1680: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Viewport = void 0;
        const n2 = i3(3656), o2 = i3(4725), a2 = i3(8460), h2 = i3(844), c2 = i3(2585);
        let l2 = t3.Viewport = class extends h2.Disposable {
          constructor(e4, t4, i4, s4, r3, o3, h3, c3) {
            super(), this._viewportElement = e4, this._scrollArea = t4, this._bufferService = i4, this._optionsService = s4, this._charSizeService = r3, this._renderService = o3, this._coreBrowserService = h3, this.scrollBarWidth = 0, this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._wheelPartialScroll = 0, this._refreshAnimationFrame = null, this._ignoreNextScrollEvent = false, this._smoothScrollState = { startTime: 0, origin: -1, target: -1 }, this._onRequestScrollLines = this.register(new a2.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this.scrollBarWidth = this._viewportElement.offsetWidth - this._scrollArea.offsetWidth || 15, this.register((0, n2.addDisposableDomListener)(this._viewportElement, "scroll", this._handleScroll.bind(this))), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate(((e5) => this._activeBuffer = e5.activeBuffer))), this._renderDimensions = this._renderService.dimensions, this.register(this._renderService.onDimensionsChange(((e5) => this._renderDimensions = e5))), this._handleThemeChange(c3.colors), this.register(c3.onChangeColors(((e5) => this._handleThemeChange(e5)))), this.register(this._optionsService.onSpecificOptionChange("scrollback", (() => this.syncScrollArea()))), setTimeout((() => this.syncScrollArea()));
          }
          _handleThemeChange(e4) {
            this._viewportElement.style.backgroundColor = e4.background.css;
          }
          reset() {
            this._currentRowHeight = 0, this._currentDeviceCellHeight = 0, this._lastRecordedBufferLength = 0, this._lastRecordedViewportHeight = 0, this._lastRecordedBufferHeight = 0, this._lastTouchY = 0, this._lastScrollTop = 0, this._coreBrowserService.window.requestAnimationFrame((() => this.syncScrollArea()));
          }
          _refresh(e4) {
            if (e4) return this._innerRefresh(), void (null !== this._refreshAnimationFrame && this._coreBrowserService.window.cancelAnimationFrame(this._refreshAnimationFrame));
            null === this._refreshAnimationFrame && (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._innerRefresh())));
          }
          _innerRefresh() {
            if (this._charSizeService.height > 0) {
              this._currentRowHeight = this._renderDimensions.device.cell.height / this._coreBrowserService.dpr, this._currentDeviceCellHeight = this._renderDimensions.device.cell.height, this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
              const e5 = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderDimensions.css.canvas.height);
              this._lastRecordedBufferHeight !== e5 && (this._lastRecordedBufferHeight = e5, this._scrollArea.style.height = this._lastRecordedBufferHeight + "px");
            }
            const e4 = this._bufferService.buffer.ydisp * this._currentRowHeight;
            this._viewportElement.scrollTop !== e4 && (this._ignoreNextScrollEvent = true, this._viewportElement.scrollTop = e4), this._refreshAnimationFrame = null;
          }
          syncScrollArea(e4 = false) {
            if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) return this._lastRecordedBufferLength = this._bufferService.buffer.lines.length, void this._refresh(e4);
            this._lastRecordedViewportHeight === this._renderService.dimensions.css.canvas.height && this._lastScrollTop === this._activeBuffer.ydisp * this._currentRowHeight && this._renderDimensions.device.cell.height === this._currentDeviceCellHeight || this._refresh(e4);
          }
          _handleScroll(e4) {
            if (this._lastScrollTop = this._viewportElement.scrollTop, !this._viewportElement.offsetParent) return;
            if (this._ignoreNextScrollEvent) return this._ignoreNextScrollEvent = false, void this._onRequestScrollLines.fire({ amount: 0, suppressScrollEvent: true });
            const t4 = Math.round(this._lastScrollTop / this._currentRowHeight) - this._bufferService.buffer.ydisp;
            this._onRequestScrollLines.fire({ amount: t4, suppressScrollEvent: true });
          }
          _smoothScroll() {
            if (this._isDisposed || -1 === this._smoothScrollState.origin || -1 === this._smoothScrollState.target) return;
            const e4 = this._smoothScrollPercent();
            this._viewportElement.scrollTop = this._smoothScrollState.origin + Math.round(e4 * (this._smoothScrollState.target - this._smoothScrollState.origin)), e4 < 1 ? this._coreBrowserService.window.requestAnimationFrame((() => this._smoothScroll())) : this._clearSmoothScrollState();
          }
          _smoothScrollPercent() {
            return this._optionsService.rawOptions.smoothScrollDuration && this._smoothScrollState.startTime ? Math.max(Math.min((Date.now() - this._smoothScrollState.startTime) / this._optionsService.rawOptions.smoothScrollDuration, 1), 0) : 1;
          }
          _clearSmoothScrollState() {
            this._smoothScrollState.startTime = 0, this._smoothScrollState.origin = -1, this._smoothScrollState.target = -1;
          }
          _bubbleScroll(e4, t4) {
            const i4 = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
            return !(t4 < 0 && 0 !== this._viewportElement.scrollTop || t4 > 0 && i4 < this._lastRecordedBufferHeight) || (e4.cancelable && e4.preventDefault(), false);
          }
          handleWheel(e4) {
            const t4 = this._getPixelsScrolled(e4);
            return 0 !== t4 && (this._optionsService.rawOptions.smoothScrollDuration ? (this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, -1 === this._smoothScrollState.target ? this._smoothScrollState.target = this._viewportElement.scrollTop + t4 : this._smoothScrollState.target += t4, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState()) : this._viewportElement.scrollTop += t4, this._bubbleScroll(e4, t4));
          }
          scrollLines(e4) {
            if (0 !== e4) if (this._optionsService.rawOptions.smoothScrollDuration) {
              const t4 = e4 * this._currentRowHeight;
              this._smoothScrollState.startTime = Date.now(), this._smoothScrollPercent() < 1 ? (this._smoothScrollState.origin = this._viewportElement.scrollTop, this._smoothScrollState.target = this._smoothScrollState.origin + t4, this._smoothScrollState.target = Math.max(Math.min(this._smoothScrollState.target, this._viewportElement.scrollHeight), 0), this._smoothScroll()) : this._clearSmoothScrollState();
            } else this._onRequestScrollLines.fire({ amount: e4, suppressScrollEvent: false });
          }
          _getPixelsScrolled(e4) {
            if (0 === e4.deltaY || e4.shiftKey) return 0;
            let t4 = this._applyScrollModifier(e4.deltaY, e4);
            return e4.deltaMode === WheelEvent.DOM_DELTA_LINE ? t4 *= this._currentRowHeight : e4.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t4 *= this._currentRowHeight * this._bufferService.rows), t4;
          }
          getBufferElements(e4, t4) {
            let i4, s4 = "";
            const r3 = [], n3 = t4 ?? this._bufferService.buffer.lines.length, o3 = this._bufferService.buffer.lines;
            for (let t5 = e4; t5 < n3; t5++) {
              const e5 = o3.get(t5);
              if (!e5) continue;
              const n4 = o3.get(t5 + 1)?.isWrapped;
              if (s4 += e5.translateToString(!n4), !n4 || t5 === o3.length - 1) {
                const e6 = document.createElement("div");
                e6.textContent = s4, r3.push(e6), s4.length > 0 && (i4 = e6), s4 = "";
              }
            }
            return { bufferElements: r3, cursorElement: i4 };
          }
          getLinesScrolled(e4) {
            if (0 === e4.deltaY || e4.shiftKey) return 0;
            let t4 = this._applyScrollModifier(e4.deltaY, e4);
            return e4.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? (t4 /= this._currentRowHeight + 0, this._wheelPartialScroll += t4, t4 = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1), this._wheelPartialScroll %= 1) : e4.deltaMode === WheelEvent.DOM_DELTA_PAGE && (t4 *= this._bufferService.rows), t4;
          }
          _applyScrollModifier(e4, t4) {
            const i4 = this._optionsService.rawOptions.fastScrollModifier;
            return "alt" === i4 && t4.altKey || "ctrl" === i4 && t4.ctrlKey || "shift" === i4 && t4.shiftKey ? e4 * this._optionsService.rawOptions.fastScrollSensitivity * this._optionsService.rawOptions.scrollSensitivity : e4 * this._optionsService.rawOptions.scrollSensitivity;
          }
          handleTouchStart(e4) {
            this._lastTouchY = e4.touches[0].pageY;
          }
          handleTouchMove(e4) {
            const t4 = this._lastTouchY - e4.touches[0].pageY;
            return this._lastTouchY = e4.touches[0].pageY, 0 !== t4 && (this._viewportElement.scrollTop += t4, this._bubbleScroll(e4, t4));
          }
        };
        t3.Viewport = l2 = s3([r2(2, c2.IBufferService), r2(3, c2.IOptionsService), r2(4, o2.ICharSizeService), r2(5, o2.IRenderService), r2(6, o2.ICoreBrowserService), r2(7, o2.IThemeService)], l2);
      }, 3107: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferDecorationRenderer = void 0;
        const n2 = i3(4725), o2 = i3(844), a2 = i3(2585);
        let h2 = t3.BufferDecorationRenderer = class extends o2.Disposable {
          constructor(e4, t4, i4, s4, r3) {
            super(), this._screenElement = e4, this._bufferService = t4, this._coreBrowserService = i4, this._decorationService = s4, this._renderService = r3, this._decorationElements = /* @__PURE__ */ new Map(), this._altBufferIsActive = false, this._dimensionsChanged = false, this._container = document.createElement("div"), this._container.classList.add("xterm-decoration-container"), this._screenElement.appendChild(this._container), this.register(this._renderService.onRenderedViewportChange((() => this._doRefreshDecorations()))), this.register(this._renderService.onDimensionsChange((() => {
              this._dimensionsChanged = true, this._queueRefresh();
            }))), this.register(this._coreBrowserService.onDprChange((() => this._queueRefresh()))), this.register(this._bufferService.buffers.onBufferActivate((() => {
              this._altBufferIsActive = this._bufferService.buffer === this._bufferService.buffers.alt;
            }))), this.register(this._decorationService.onDecorationRegistered((() => this._queueRefresh()))), this.register(this._decorationService.onDecorationRemoved(((e5) => this._removeDecoration(e5)))), this.register((0, o2.toDisposable)((() => {
              this._container.remove(), this._decorationElements.clear();
            })));
          }
          _queueRefresh() {
            void 0 === this._animationFrame && (this._animationFrame = this._renderService.addRefreshCallback((() => {
              this._doRefreshDecorations(), this._animationFrame = void 0;
            })));
          }
          _doRefreshDecorations() {
            for (const e4 of this._decorationService.decorations) this._renderDecoration(e4);
            this._dimensionsChanged = false;
          }
          _renderDecoration(e4) {
            this._refreshStyle(e4), this._dimensionsChanged && this._refreshXPosition(e4);
          }
          _createElement(e4) {
            const t4 = this._coreBrowserService.mainDocument.createElement("div");
            t4.classList.add("xterm-decoration"), t4.classList.toggle("xterm-decoration-top-layer", "top" === e4?.options?.layer), t4.style.width = `${Math.round((e4.options.width || 1) * this._renderService.dimensions.css.cell.width)}px`, t4.style.height = (e4.options.height || 1) * this._renderService.dimensions.css.cell.height + "px", t4.style.top = (e4.marker.line - this._bufferService.buffers.active.ydisp) * this._renderService.dimensions.css.cell.height + "px", t4.style.lineHeight = `${this._renderService.dimensions.css.cell.height}px`;
            const i4 = e4.options.x ?? 0;
            return i4 && i4 > this._bufferService.cols && (t4.style.display = "none"), this._refreshXPosition(e4, t4), t4;
          }
          _refreshStyle(e4) {
            const t4 = e4.marker.line - this._bufferService.buffers.active.ydisp;
            if (t4 < 0 || t4 >= this._bufferService.rows) e4.element && (e4.element.style.display = "none", e4.onRenderEmitter.fire(e4.element));
            else {
              let i4 = this._decorationElements.get(e4);
              i4 || (i4 = this._createElement(e4), e4.element = i4, this._decorationElements.set(e4, i4), this._container.appendChild(i4), e4.onDispose((() => {
                this._decorationElements.delete(e4), i4.remove();
              }))), i4.style.top = t4 * this._renderService.dimensions.css.cell.height + "px", i4.style.display = this._altBufferIsActive ? "none" : "block", e4.onRenderEmitter.fire(i4);
            }
          }
          _refreshXPosition(e4, t4 = e4.element) {
            if (!t4) return;
            const i4 = e4.options.x ?? 0;
            "right" === (e4.options.anchor || "left") ? t4.style.right = i4 ? i4 * this._renderService.dimensions.css.cell.width + "px" : "" : t4.style.left = i4 ? i4 * this._renderService.dimensions.css.cell.width + "px" : "";
          }
          _removeDecoration(e4) {
            this._decorationElements.get(e4)?.remove(), this._decorationElements.delete(e4), e4.dispose();
          }
        };
        t3.BufferDecorationRenderer = h2 = s3([r2(1, a2.IBufferService), r2(2, n2.ICoreBrowserService), r2(3, a2.IDecorationService), r2(4, n2.IRenderService)], h2);
      }, 5871: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ColorZoneStore = void 0, t3.ColorZoneStore = class {
          constructor() {
            this._zones = [], this._zonePool = [], this._zonePoolIndex = 0, this._linePadding = { full: 0, left: 0, center: 0, right: 0 };
          }
          get zones() {
            return this._zonePool.length = Math.min(this._zonePool.length, this._zones.length), this._zones;
          }
          clear() {
            this._zones.length = 0, this._zonePoolIndex = 0;
          }
          addDecoration(e4) {
            if (e4.options.overviewRulerOptions) {
              for (const t4 of this._zones) if (t4.color === e4.options.overviewRulerOptions.color && t4.position === e4.options.overviewRulerOptions.position) {
                if (this._lineIntersectsZone(t4, e4.marker.line)) return;
                if (this._lineAdjacentToZone(t4, e4.marker.line, e4.options.overviewRulerOptions.position)) return void this._addLineToZone(t4, e4.marker.line);
              }
              if (this._zonePoolIndex < this._zonePool.length) return this._zonePool[this._zonePoolIndex].color = e4.options.overviewRulerOptions.color, this._zonePool[this._zonePoolIndex].position = e4.options.overviewRulerOptions.position, this._zonePool[this._zonePoolIndex].startBufferLine = e4.marker.line, this._zonePool[this._zonePoolIndex].endBufferLine = e4.marker.line, void this._zones.push(this._zonePool[this._zonePoolIndex++]);
              this._zones.push({ color: e4.options.overviewRulerOptions.color, position: e4.options.overviewRulerOptions.position, startBufferLine: e4.marker.line, endBufferLine: e4.marker.line }), this._zonePool.push(this._zones[this._zones.length - 1]), this._zonePoolIndex++;
            }
          }
          setPadding(e4) {
            this._linePadding = e4;
          }
          _lineIntersectsZone(e4, t4) {
            return t4 >= e4.startBufferLine && t4 <= e4.endBufferLine;
          }
          _lineAdjacentToZone(e4, t4, i3) {
            return t4 >= e4.startBufferLine - this._linePadding[i3 || "full"] && t4 <= e4.endBufferLine + this._linePadding[i3 || "full"];
          }
          _addLineToZone(e4, t4) {
            e4.startBufferLine = Math.min(e4.startBufferLine, t4), e4.endBufferLine = Math.max(e4.endBufferLine, t4);
          }
        };
      }, 5744: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.OverviewRulerRenderer = void 0;
        const n2 = i3(5871), o2 = i3(4725), a2 = i3(844), h2 = i3(2585), c2 = { full: 0, left: 0, center: 0, right: 0 }, l2 = { full: 0, left: 0, center: 0, right: 0 }, d2 = { full: 0, left: 0, center: 0, right: 0 };
        let _2 = t3.OverviewRulerRenderer = class extends a2.Disposable {
          get _width() {
            return this._optionsService.options.overviewRulerWidth || 0;
          }
          constructor(e4, t4, i4, s4, r3, o3, h3) {
            super(), this._viewportElement = e4, this._screenElement = t4, this._bufferService = i4, this._decorationService = s4, this._renderService = r3, this._optionsService = o3, this._coreBrowserService = h3, this._colorZoneStore = new n2.ColorZoneStore(), this._shouldUpdateDimensions = true, this._shouldUpdateAnchor = true, this._lastKnownBufferLength = 0, this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add("xterm-decoration-overview-ruler"), this._refreshCanvasDimensions(), this._viewportElement.parentElement?.insertBefore(this._canvas, this._viewportElement);
            const c3 = this._canvas.getContext("2d");
            if (!c3) throw new Error("Ctx cannot be null");
            this._ctx = c3, this._registerDecorationListeners(), this._registerBufferChangeListeners(), this._registerDimensionChangeListeners(), this.register((0, a2.toDisposable)((() => {
              this._canvas?.remove();
            })));
          }
          _registerDecorationListeners() {
            this.register(this._decorationService.onDecorationRegistered((() => this._queueRefresh(void 0, true)))), this.register(this._decorationService.onDecorationRemoved((() => this._queueRefresh(void 0, true))));
          }
          _registerBufferChangeListeners() {
            this.register(this._renderService.onRenderedViewportChange((() => this._queueRefresh()))), this.register(this._bufferService.buffers.onBufferActivate((() => {
              this._canvas.style.display = this._bufferService.buffer === this._bufferService.buffers.alt ? "none" : "block";
            }))), this.register(this._bufferService.onScroll((() => {
              this._lastKnownBufferLength !== this._bufferService.buffers.normal.lines.length && (this._refreshDrawHeightConstants(), this._refreshColorZonePadding());
            })));
          }
          _registerDimensionChangeListeners() {
            this.register(this._renderService.onRender((() => {
              this._containerHeight && this._containerHeight === this._screenElement.clientHeight || (this._queueRefresh(true), this._containerHeight = this._screenElement.clientHeight);
            }))), this.register(this._optionsService.onSpecificOptionChange("overviewRulerWidth", (() => this._queueRefresh(true)))), this.register(this._coreBrowserService.onDprChange((() => this._queueRefresh(true)))), this._queueRefresh(true);
          }
          _refreshDrawConstants() {
            const e4 = Math.floor(this._canvas.width / 3), t4 = Math.ceil(this._canvas.width / 3);
            l2.full = this._canvas.width, l2.left = e4, l2.center = t4, l2.right = e4, this._refreshDrawHeightConstants(), d2.full = 0, d2.left = 0, d2.center = l2.left, d2.right = l2.left + l2.center;
          }
          _refreshDrawHeightConstants() {
            c2.full = Math.round(2 * this._coreBrowserService.dpr);
            const e4 = this._canvas.height / this._bufferService.buffer.lines.length, t4 = Math.round(Math.max(Math.min(e4, 12), 6) * this._coreBrowserService.dpr);
            c2.left = t4, c2.center = t4, c2.right = t4;
          }
          _refreshColorZonePadding() {
            this._colorZoneStore.setPadding({ full: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * c2.full), left: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * c2.left), center: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * c2.center), right: Math.floor(this._bufferService.buffers.active.lines.length / (this._canvas.height - 1) * c2.right) }), this._lastKnownBufferLength = this._bufferService.buffers.normal.lines.length;
          }
          _refreshCanvasDimensions() {
            this._canvas.style.width = `${this._width}px`, this._canvas.width = Math.round(this._width * this._coreBrowserService.dpr), this._canvas.style.height = `${this._screenElement.clientHeight}px`, this._canvas.height = Math.round(this._screenElement.clientHeight * this._coreBrowserService.dpr), this._refreshDrawConstants(), this._refreshColorZonePadding();
          }
          _refreshDecorations() {
            this._shouldUpdateDimensions && this._refreshCanvasDimensions(), this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height), this._colorZoneStore.clear();
            for (const e5 of this._decorationService.decorations) this._colorZoneStore.addDecoration(e5);
            this._ctx.lineWidth = 1;
            const e4 = this._colorZoneStore.zones;
            for (const t4 of e4) "full" !== t4.position && this._renderColorZone(t4);
            for (const t4 of e4) "full" === t4.position && this._renderColorZone(t4);
            this._shouldUpdateDimensions = false, this._shouldUpdateAnchor = false;
          }
          _renderColorZone(e4) {
            this._ctx.fillStyle = e4.color, this._ctx.fillRect(d2[e4.position || "full"], Math.round((this._canvas.height - 1) * (e4.startBufferLine / this._bufferService.buffers.active.lines.length) - c2[e4.position || "full"] / 2), l2[e4.position || "full"], Math.round((this._canvas.height - 1) * ((e4.endBufferLine - e4.startBufferLine) / this._bufferService.buffers.active.lines.length) + c2[e4.position || "full"]));
          }
          _queueRefresh(e4, t4) {
            this._shouldUpdateDimensions = e4 || this._shouldUpdateDimensions, this._shouldUpdateAnchor = t4 || this._shouldUpdateAnchor, void 0 === this._animationFrame && (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => {
              this._refreshDecorations(), this._animationFrame = void 0;
            })));
          }
        };
        t3.OverviewRulerRenderer = _2 = s3([r2(2, h2.IBufferService), r2(3, h2.IDecorationService), r2(4, o2.IRenderService), r2(5, h2.IOptionsService), r2(6, o2.ICoreBrowserService)], _2);
      }, 2950: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CompositionHelper = void 0;
        const n2 = i3(4725), o2 = i3(2585), a2 = i3(2584);
        let h2 = t3.CompositionHelper = class {
          get isComposing() {
            return this._isComposing;
          }
          constructor(e4, t4, i4, s4, r3, n3) {
            this._textarea = e4, this._compositionView = t4, this._bufferService = i4, this._optionsService = s4, this._coreService = r3, this._renderService = n3, this._isComposing = false, this._isSendingComposition = false, this._compositionPosition = { start: 0, end: 0 }, this._dataAlreadySent = "";
          }
          compositionstart() {
            this._isComposing = true, this._compositionPosition.start = this._textarea.value.length, this._compositionView.textContent = "", this._dataAlreadySent = "", this._compositionView.classList.add("active");
          }
          compositionupdate(e4) {
            this._compositionView.textContent = e4.data, this.updateCompositionElements(), setTimeout((() => {
              this._compositionPosition.end = this._textarea.value.length;
            }), 0);
          }
          compositionend() {
            this._finalizeComposition(true);
          }
          keydown(e4) {
            if (this._isComposing || this._isSendingComposition) {
              if (229 === e4.keyCode) return false;
              if (16 === e4.keyCode || 17 === e4.keyCode || 18 === e4.keyCode) return false;
              this._finalizeComposition(false);
            }
            return 229 !== e4.keyCode || (this._handleAnyTextareaChanges(), false);
          }
          _finalizeComposition(e4) {
            if (this._compositionView.classList.remove("active"), this._isComposing = false, e4) {
              const e5 = { start: this._compositionPosition.start, end: this._compositionPosition.end };
              this._isSendingComposition = true, setTimeout((() => {
                if (this._isSendingComposition) {
                  let t4;
                  this._isSendingComposition = false, e5.start += this._dataAlreadySent.length, t4 = this._isComposing ? this._textarea.value.substring(e5.start, e5.end) : this._textarea.value.substring(e5.start), t4.length > 0 && this._coreService.triggerDataEvent(t4, true);
                }
              }), 0);
            } else {
              this._isSendingComposition = false;
              const e5 = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
              this._coreService.triggerDataEvent(e5, true);
            }
          }
          _handleAnyTextareaChanges() {
            const e4 = this._textarea.value;
            setTimeout((() => {
              if (!this._isComposing) {
                const t4 = this._textarea.value, i4 = t4.replace(e4, "");
                this._dataAlreadySent = i4, t4.length > e4.length ? this._coreService.triggerDataEvent(i4, true) : t4.length < e4.length ? this._coreService.triggerDataEvent(`${a2.C0.DEL}`, true) : t4.length === e4.length && t4 !== e4 && this._coreService.triggerDataEvent(t4, true);
              }
            }), 0);
          }
          updateCompositionElements(e4) {
            if (this._isComposing) {
              if (this._bufferService.buffer.isCursorInViewport) {
                const e5 = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1), t4 = this._renderService.dimensions.css.cell.height, i4 = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height, s4 = e5 * this._renderService.dimensions.css.cell.width;
                this._compositionView.style.left = s4 + "px", this._compositionView.style.top = i4 + "px", this._compositionView.style.height = t4 + "px", this._compositionView.style.lineHeight = t4 + "px", this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
                const r3 = this._compositionView.getBoundingClientRect();
                this._textarea.style.left = s4 + "px", this._textarea.style.top = i4 + "px", this._textarea.style.width = Math.max(r3.width, 1) + "px", this._textarea.style.height = Math.max(r3.height, 1) + "px", this._textarea.style.lineHeight = r3.height + "px";
              }
              e4 || setTimeout((() => this.updateCompositionElements(true)), 0);
            }
          }
        };
        t3.CompositionHelper = h2 = s3([r2(2, o2.IBufferService), r2(3, o2.IOptionsService), r2(4, o2.ICoreService), r2(5, n2.IRenderService)], h2);
      }, 9806: (e3, t3) => {
        function i3(e4, t4, i4) {
          const s3 = i4.getBoundingClientRect(), r2 = e4.getComputedStyle(i4), n2 = parseInt(r2.getPropertyValue("padding-left")), o2 = parseInt(r2.getPropertyValue("padding-top"));
          return [t4.clientX - s3.left - n2, t4.clientY - s3.top - o2];
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.getCoords = t3.getCoordsRelativeToElement = void 0, t3.getCoordsRelativeToElement = i3, t3.getCoords = function(e4, t4, s3, r2, n2, o2, a2, h2, c2) {
          if (!o2) return;
          const l2 = i3(e4, t4, s3);
          return l2 ? (l2[0] = Math.ceil((l2[0] + (c2 ? a2 / 2 : 0)) / a2), l2[1] = Math.ceil(l2[1] / h2), l2[0] = Math.min(Math.max(l2[0], 1), r2 + (c2 ? 1 : 0)), l2[1] = Math.min(Math.max(l2[1], 1), n2), l2) : void 0;
        };
      }, 9504: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.moveToCellSequence = void 0;
        const s3 = i3(2584);
        function r2(e4, t4, i4, s4) {
          const r3 = e4 - n2(e4, i4), a3 = t4 - n2(t4, i4), l2 = Math.abs(r3 - a3) - (function(e5, t5, i5) {
            let s5 = 0;
            const r4 = e5 - n2(e5, i5), a4 = t5 - n2(t5, i5);
            for (let n3 = 0; n3 < Math.abs(r4 - a4); n3++) {
              const a5 = "A" === o2(e5, t5) ? -1 : 1, h3 = i5.buffer.lines.get(r4 + a5 * n3);
              h3?.isWrapped && s5++;
            }
            return s5;
          })(e4, t4, i4);
          return c2(l2, h2(o2(e4, t4), s4));
        }
        function n2(e4, t4) {
          let i4 = 0, s4 = t4.buffer.lines.get(e4), r3 = s4?.isWrapped;
          for (; r3 && e4 >= 0 && e4 < t4.rows; ) i4++, s4 = t4.buffer.lines.get(--e4), r3 = s4?.isWrapped;
          return i4;
        }
        function o2(e4, t4) {
          return e4 > t4 ? "A" : "B";
        }
        function a2(e4, t4, i4, s4, r3, n3) {
          let o3 = e4, a3 = t4, h3 = "";
          for (; o3 !== i4 || a3 !== s4; ) o3 += r3 ? 1 : -1, r3 && o3 > n3.cols - 1 ? (h3 += n3.buffer.translateBufferLineToString(a3, false, e4, o3), o3 = 0, e4 = 0, a3++) : !r3 && o3 < 0 && (h3 += n3.buffer.translateBufferLineToString(a3, false, 0, e4 + 1), o3 = n3.cols - 1, e4 = o3, a3--);
          return h3 + n3.buffer.translateBufferLineToString(a3, false, e4, o3);
        }
        function h2(e4, t4) {
          const i4 = t4 ? "O" : "[";
          return s3.C0.ESC + i4 + e4;
        }
        function c2(e4, t4) {
          e4 = Math.floor(e4);
          let i4 = "";
          for (let s4 = 0; s4 < e4; s4++) i4 += t4;
          return i4;
        }
        t3.moveToCellSequence = function(e4, t4, i4, s4) {
          const o3 = i4.buffer.x, l2 = i4.buffer.y;
          if (!i4.buffer.hasScrollback) return (function(e5, t5, i5, s5, o4, l3) {
            return 0 === r2(t5, s5, o4, l3).length ? "" : c2(a2(e5, t5, e5, t5 - n2(t5, o4), false, o4).length, h2("D", l3));
          })(o3, l2, 0, t4, i4, s4) + r2(l2, t4, i4, s4) + (function(e5, t5, i5, s5, o4, l3) {
            let d3;
            d3 = r2(t5, s5, o4, l3).length > 0 ? s5 - n2(s5, o4) : t5;
            const _3 = s5, u2 = (function(e6, t6, i6, s6, o5, a3) {
              let h3;
              return h3 = r2(i6, s6, o5, a3).length > 0 ? s6 - n2(s6, o5) : t6, e6 < i6 && h3 <= s6 || e6 >= i6 && h3 < s6 ? "C" : "D";
            })(e5, t5, i5, s5, o4, l3);
            return c2(a2(e5, d3, i5, _3, "C" === u2, o4).length, h2(u2, l3));
          })(o3, l2, e4, t4, i4, s4);
          let d2;
          if (l2 === t4) return d2 = o3 > e4 ? "D" : "C", c2(Math.abs(o3 - e4), h2(d2, s4));
          d2 = l2 > t4 ? "D" : "C";
          const _2 = Math.abs(l2 - t4);
          return c2((function(e5, t5) {
            return t5.cols - e5;
          })(l2 > t4 ? e4 : o3, i4) + (_2 - 1) * i4.cols + 1 + ((l2 > t4 ? o3 : e4) - 1), h2(d2, s4));
        };
      }, 1296: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DomRenderer = void 0;
        const n2 = i3(3787), o2 = i3(2550), a2 = i3(2223), h2 = i3(6171), c2 = i3(6052), l2 = i3(4725), d2 = i3(8055), _2 = i3(8460), u2 = i3(844), f2 = i3(2585), v2 = "xterm-dom-renderer-owner-", p2 = "xterm-rows", g2 = "xterm-fg-", m2 = "xterm-bg-", S2 = "xterm-focus", C2 = "xterm-selection";
        let b2 = 1, w2 = t3.DomRenderer = class extends u2.Disposable {
          constructor(e4, t4, i4, s4, r3, a3, l3, d3, f3, g3, m3, S3, w3) {
            super(), this._terminal = e4, this._document = t4, this._element = i4, this._screenElement = s4, this._viewportElement = r3, this._helperContainer = a3, this._linkifier2 = l3, this._charSizeService = f3, this._optionsService = g3, this._bufferService = m3, this._coreBrowserService = S3, this._themeService = w3, this._terminalClass = b2++, this._rowElements = [], this._selectionRenderModel = (0, c2.createSelectionRenderModel)(), this.onRequestRedraw = this.register(new _2.EventEmitter()).event, this._rowContainer = this._document.createElement("div"), this._rowContainer.classList.add(p2), this._rowContainer.style.lineHeight = "normal", this._rowContainer.setAttribute("aria-hidden", "true"), this._refreshRowElements(this._bufferService.cols, this._bufferService.rows), this._selectionContainer = this._document.createElement("div"), this._selectionContainer.classList.add(C2), this._selectionContainer.setAttribute("aria-hidden", "true"), this.dimensions = (0, h2.createRenderDimensions)(), this._updateDimensions(), this.register(this._optionsService.onOptionChange((() => this._handleOptionsChanged()))), this.register(this._themeService.onChangeColors(((e5) => this._injectCss(e5)))), this._injectCss(this._themeService.colors), this._rowFactory = d3.createInstance(n2.DomRendererRowFactory, document), this._element.classList.add(v2 + this._terminalClass), this._screenElement.appendChild(this._rowContainer), this._screenElement.appendChild(this._selectionContainer), this.register(this._linkifier2.onShowLinkUnderline(((e5) => this._handleLinkHover(e5)))), this.register(this._linkifier2.onHideLinkUnderline(((e5) => this._handleLinkLeave(e5)))), this.register((0, u2.toDisposable)((() => {
              this._element.classList.remove(v2 + this._terminalClass), this._rowContainer.remove(), this._selectionContainer.remove(), this._widthCache.dispose(), this._themeStyleElement.remove(), this._dimensionsStyleElement.remove();
            }))), this._widthCache = new o2.WidthCache(this._document, this._helperContainer), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          _updateDimensions() {
            const e4 = this._coreBrowserService.dpr;
            this.dimensions.device.char.width = this._charSizeService.width * e4, this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * e4), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.left = 0, this.dimensions.device.char.top = 0, this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols, this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows, this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / e4), this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / e4), this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols, this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
            for (const e5 of this._rowElements) e5.style.width = `${this.dimensions.css.canvas.width}px`, e5.style.height = `${this.dimensions.css.cell.height}px`, e5.style.lineHeight = `${this.dimensions.css.cell.height}px`, e5.style.overflow = "hidden";
            this._dimensionsStyleElement || (this._dimensionsStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._dimensionsStyleElement));
            const t4 = `${this._terminalSelector} .${p2} span { display: inline-block; height: 100%; vertical-align: top;}`;
            this._dimensionsStyleElement.textContent = t4, this._selectionContainer.style.height = this._viewportElement.style.height, this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
          }
          _injectCss(e4) {
            this._themeStyleElement || (this._themeStyleElement = this._document.createElement("style"), this._screenElement.appendChild(this._themeStyleElement));
            let t4 = `${this._terminalSelector} .${p2} { color: ${e4.foreground.css}; font-family: ${this._optionsService.rawOptions.fontFamily}; font-size: ${this._optionsService.rawOptions.fontSize}px; font-kerning: none; white-space: pre}`;
            t4 += `${this._terminalSelector} .${p2} .xterm-dim { color: ${d2.color.multiplyOpacity(e4.foreground, 0.5).css};}`, t4 += `${this._terminalSelector} span:not(.xterm-bold) { font-weight: ${this._optionsService.rawOptions.fontWeight};}${this._terminalSelector} span.xterm-bold { font-weight: ${this._optionsService.rawOptions.fontWeightBold};}${this._terminalSelector} span.xterm-italic { font-style: italic;}`;
            const i4 = `blink_underline_${this._terminalClass}`, s4 = `blink_bar_${this._terminalClass}`, r3 = `blink_block_${this._terminalClass}`;
            t4 += `@keyframes ${i4} { 50% {  border-bottom-style: hidden; }}`, t4 += `@keyframes ${s4} { 50% {  box-shadow: none; }}`, t4 += `@keyframes ${r3} { 0% {  background-color: ${e4.cursor.css};  color: ${e4.cursorAccent.css}; } 50% {  background-color: inherit;  color: ${e4.cursor.css}; }}`, t4 += `${this._terminalSelector} .${p2}.${S2} .xterm-cursor.xterm-cursor-blink.xterm-cursor-underline { animation: ${i4} 1s step-end infinite;}${this._terminalSelector} .${p2}.${S2} .xterm-cursor.xterm-cursor-blink.xterm-cursor-bar { animation: ${s4} 1s step-end infinite;}${this._terminalSelector} .${p2}.${S2} .xterm-cursor.xterm-cursor-blink.xterm-cursor-block { animation: ${r3} 1s step-end infinite;}${this._terminalSelector} .${p2} .xterm-cursor.xterm-cursor-block { background-color: ${e4.cursor.css}; color: ${e4.cursorAccent.css};}${this._terminalSelector} .${p2} .xterm-cursor.xterm-cursor-block:not(.xterm-cursor-blink) { background-color: ${e4.cursor.css} !important; color: ${e4.cursorAccent.css} !important;}${this._terminalSelector} .${p2} .xterm-cursor.xterm-cursor-outline { outline: 1px solid ${e4.cursor.css}; outline-offset: -1px;}${this._terminalSelector} .${p2} .xterm-cursor.xterm-cursor-bar { box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${e4.cursor.css} inset;}${this._terminalSelector} .${p2} .xterm-cursor.xterm-cursor-underline { border-bottom: 1px ${e4.cursor.css}; border-bottom-style: solid; height: calc(100% - 1px);}`, t4 += `${this._terminalSelector} .${C2} { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;}${this._terminalSelector}.focus .${C2} div { position: absolute; background-color: ${e4.selectionBackgroundOpaque.css};}${this._terminalSelector} .${C2} div { position: absolute; background-color: ${e4.selectionInactiveBackgroundOpaque.css};}`;
            for (const [i5, s5] of e4.ansi.entries()) t4 += `${this._terminalSelector} .${g2}${i5} { color: ${s5.css}; }${this._terminalSelector} .${g2}${i5}.xterm-dim { color: ${d2.color.multiplyOpacity(s5, 0.5).css}; }${this._terminalSelector} .${m2}${i5} { background-color: ${s5.css}; }`;
            t4 += `${this._terminalSelector} .${g2}${a2.INVERTED_DEFAULT_COLOR} { color: ${d2.color.opaque(e4.background).css}; }${this._terminalSelector} .${g2}${a2.INVERTED_DEFAULT_COLOR}.xterm-dim { color: ${d2.color.multiplyOpacity(d2.color.opaque(e4.background), 0.5).css}; }${this._terminalSelector} .${m2}${a2.INVERTED_DEFAULT_COLOR} { background-color: ${e4.foreground.css}; }`, this._themeStyleElement.textContent = t4;
          }
          _setDefaultSpacing() {
            const e4 = this.dimensions.css.cell.width - this._widthCache.get("W", false, false);
            this._rowContainer.style.letterSpacing = `${e4}px`, this._rowFactory.defaultSpacing = e4;
          }
          handleDevicePixelRatioChange() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          _refreshRowElements(e4, t4) {
            for (let e5 = this._rowElements.length; e5 <= t4; e5++) {
              const e6 = this._document.createElement("div");
              this._rowContainer.appendChild(e6), this._rowElements.push(e6);
            }
            for (; this._rowElements.length > t4; ) this._rowContainer.removeChild(this._rowElements.pop());
          }
          handleResize(e4, t4) {
            this._refreshRowElements(e4, t4), this._updateDimensions(), this.handleSelectionChanged(this._selectionRenderModel.selectionStart, this._selectionRenderModel.selectionEnd, this._selectionRenderModel.columnSelectMode);
          }
          handleCharSizeChanged() {
            this._updateDimensions(), this._widthCache.clear(), this._setDefaultSpacing();
          }
          handleBlur() {
            this._rowContainer.classList.remove(S2), this.renderRows(0, this._bufferService.rows - 1);
          }
          handleFocus() {
            this._rowContainer.classList.add(S2), this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
          }
          handleSelectionChanged(e4, t4, i4) {
            if (this._selectionContainer.replaceChildren(), this._rowFactory.handleSelectionChanged(e4, t4, i4), this.renderRows(0, this._bufferService.rows - 1), !e4 || !t4) return;
            this._selectionRenderModel.update(this._terminal, e4, t4, i4);
            const s4 = this._selectionRenderModel.viewportStartRow, r3 = this._selectionRenderModel.viewportEndRow, n3 = this._selectionRenderModel.viewportCappedStartRow, o3 = this._selectionRenderModel.viewportCappedEndRow;
            if (n3 >= this._bufferService.rows || o3 < 0) return;
            const a3 = this._document.createDocumentFragment();
            if (i4) {
              const i5 = e4[0] > t4[0];
              a3.appendChild(this._createSelectionElement(n3, i5 ? t4[0] : e4[0], i5 ? e4[0] : t4[0], o3 - n3 + 1));
            } else {
              const i5 = s4 === n3 ? e4[0] : 0, h3 = n3 === r3 ? t4[0] : this._bufferService.cols;
              a3.appendChild(this._createSelectionElement(n3, i5, h3));
              const c3 = o3 - n3 - 1;
              if (a3.appendChild(this._createSelectionElement(n3 + 1, 0, this._bufferService.cols, c3)), n3 !== o3) {
                const e5 = r3 === o3 ? t4[0] : this._bufferService.cols;
                a3.appendChild(this._createSelectionElement(o3, 0, e5));
              }
            }
            this._selectionContainer.appendChild(a3);
          }
          _createSelectionElement(e4, t4, i4, s4 = 1) {
            const r3 = this._document.createElement("div"), n3 = t4 * this.dimensions.css.cell.width;
            let o3 = this.dimensions.css.cell.width * (i4 - t4);
            return n3 + o3 > this.dimensions.css.canvas.width && (o3 = this.dimensions.css.canvas.width - n3), r3.style.height = s4 * this.dimensions.css.cell.height + "px", r3.style.top = e4 * this.dimensions.css.cell.height + "px", r3.style.left = `${n3}px`, r3.style.width = `${o3}px`, r3;
          }
          handleCursorMove() {
          }
          _handleOptionsChanged() {
            this._updateDimensions(), this._injectCss(this._themeService.colors), this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold), this._setDefaultSpacing();
          }
          clear() {
            for (const e4 of this._rowElements) e4.replaceChildren();
          }
          renderRows(e4, t4) {
            const i4 = this._bufferService.buffer, s4 = i4.ybase + i4.y, r3 = Math.min(i4.x, this._bufferService.cols - 1), n3 = this._optionsService.rawOptions.cursorBlink, o3 = this._optionsService.rawOptions.cursorStyle, a3 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let h3 = e4; h3 <= t4; h3++) {
              const e5 = h3 + i4.ydisp, t5 = this._rowElements[h3], c3 = i4.lines.get(e5);
              if (!t5 || !c3) break;
              t5.replaceChildren(...this._rowFactory.createRow(c3, e5, e5 === s4, o3, a3, r3, n3, this.dimensions.css.cell.width, this._widthCache, -1, -1));
            }
          }
          get _terminalSelector() {
            return `.${v2}${this._terminalClass}`;
          }
          _handleLinkHover(e4) {
            this._setCellUnderline(e4.x1, e4.x2, e4.y1, e4.y2, e4.cols, true);
          }
          _handleLinkLeave(e4) {
            this._setCellUnderline(e4.x1, e4.x2, e4.y1, e4.y2, e4.cols, false);
          }
          _setCellUnderline(e4, t4, i4, s4, r3, n3) {
            i4 < 0 && (e4 = 0), s4 < 0 && (t4 = 0);
            const o3 = this._bufferService.rows - 1;
            i4 = Math.max(Math.min(i4, o3), 0), s4 = Math.max(Math.min(s4, o3), 0), r3 = Math.min(r3, this._bufferService.cols);
            const a3 = this._bufferService.buffer, h3 = a3.ybase + a3.y, c3 = Math.min(a3.x, r3 - 1), l3 = this._optionsService.rawOptions.cursorBlink, d3 = this._optionsService.rawOptions.cursorStyle, _3 = this._optionsService.rawOptions.cursorInactiveStyle;
            for (let o4 = i4; o4 <= s4; ++o4) {
              const u3 = o4 + a3.ydisp, f3 = this._rowElements[o4], v3 = a3.lines.get(u3);
              if (!f3 || !v3) break;
              f3.replaceChildren(...this._rowFactory.createRow(v3, u3, u3 === h3, d3, _3, c3, l3, this.dimensions.css.cell.width, this._widthCache, n3 ? o4 === i4 ? e4 : 0 : -1, n3 ? (o4 === s4 ? t4 : r3) - 1 : -1));
            }
          }
        };
        t3.DomRenderer = w2 = s3([r2(7, f2.IInstantiationService), r2(8, l2.ICharSizeService), r2(9, f2.IOptionsService), r2(10, f2.IBufferService), r2(11, l2.ICoreBrowserService), r2(12, l2.IThemeService)], w2);
      }, 3787: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DomRendererRowFactory = void 0;
        const n2 = i3(2223), o2 = i3(643), a2 = i3(511), h2 = i3(2585), c2 = i3(8055), l2 = i3(4725), d2 = i3(4269), _2 = i3(6171), u2 = i3(3734);
        let f2 = t3.DomRendererRowFactory = class {
          constructor(e4, t4, i4, s4, r3, n3, o3) {
            this._document = e4, this._characterJoinerService = t4, this._optionsService = i4, this._coreBrowserService = s4, this._coreService = r3, this._decorationService = n3, this._themeService = o3, this._workCell = new a2.CellData(), this._columnSelectMode = false, this.defaultSpacing = 0;
          }
          handleSelectionChanged(e4, t4, i4) {
            this._selectionStart = e4, this._selectionEnd = t4, this._columnSelectMode = i4;
          }
          createRow(e4, t4, i4, s4, r3, a3, h3, l3, _3, f3, p2) {
            const g2 = [], m2 = this._characterJoinerService.getJoinedCharacters(t4), S2 = this._themeService.colors;
            let C2, b2 = e4.getNoBgTrimmedLength();
            i4 && b2 < a3 + 1 && (b2 = a3 + 1);
            let w2 = 0, y2 = "", E2 = 0, k2 = 0, L2 = 0, D2 = false, R2 = 0, x2 = false, A2 = 0;
            const B2 = [], T2 = -1 !== f3 && -1 !== p2;
            for (let M2 = 0; M2 < b2; M2++) {
              e4.loadCell(M2, this._workCell);
              let b3 = this._workCell.getWidth();
              if (0 === b3) continue;
              let O2 = false, P2 = M2, I2 = this._workCell;
              if (m2.length > 0 && M2 === m2[0][0]) {
                O2 = true;
                const t5 = m2.shift();
                I2 = new d2.JoinedCellData(this._workCell, e4.translateToString(true, t5[0], t5[1]), t5[1] - t5[0]), P2 = t5[1] - 1, b3 = I2.getWidth();
              }
              const H2 = this._isCellInSelection(M2, t4), F2 = i4 && M2 === a3, W2 = T2 && M2 >= f3 && M2 <= p2;
              let U2 = false;
              this._decorationService.forEachDecorationAtCell(M2, t4, void 0, ((e5) => {
                U2 = true;
              }));
              let N2 = I2.getChars() || o2.WHITESPACE_CELL_CHAR;
              if (" " === N2 && (I2.isUnderline() || I2.isOverline()) && (N2 = " "), A2 = b3 * l3 - _3.get(N2, I2.isBold(), I2.isItalic()), C2) {
                if (w2 && (H2 && x2 || !H2 && !x2 && I2.bg === E2) && (H2 && x2 && S2.selectionForeground || I2.fg === k2) && I2.extended.ext === L2 && W2 === D2 && A2 === R2 && !F2 && !O2 && !U2) {
                  I2.isInvisible() ? y2 += o2.WHITESPACE_CELL_CHAR : y2 += N2, w2++;
                  continue;
                }
                w2 && (C2.textContent = y2), C2 = this._document.createElement("span"), w2 = 0, y2 = "";
              } else C2 = this._document.createElement("span");
              if (E2 = I2.bg, k2 = I2.fg, L2 = I2.extended.ext, D2 = W2, R2 = A2, x2 = H2, O2 && a3 >= M2 && a3 <= P2 && (a3 = M2), !this._coreService.isCursorHidden && F2 && this._coreService.isCursorInitialized) {
                if (B2.push("xterm-cursor"), this._coreBrowserService.isFocused) h3 && B2.push("xterm-cursor-blink"), B2.push("bar" === s4 ? "xterm-cursor-bar" : "underline" === s4 ? "xterm-cursor-underline" : "xterm-cursor-block");
                else if (r3) switch (r3) {
                  case "outline":
                    B2.push("xterm-cursor-outline");
                    break;
                  case "block":
                    B2.push("xterm-cursor-block");
                    break;
                  case "bar":
                    B2.push("xterm-cursor-bar");
                    break;
                  case "underline":
                    B2.push("xterm-cursor-underline");
                }
              }
              if (I2.isBold() && B2.push("xterm-bold"), I2.isItalic() && B2.push("xterm-italic"), I2.isDim() && B2.push("xterm-dim"), y2 = I2.isInvisible() ? o2.WHITESPACE_CELL_CHAR : I2.getChars() || o2.WHITESPACE_CELL_CHAR, I2.isUnderline() && (B2.push(`xterm-underline-${I2.extended.underlineStyle}`), " " === y2 && (y2 = " "), !I2.isUnderlineColorDefault())) if (I2.isUnderlineColorRGB()) C2.style.textDecorationColor = `rgb(${u2.AttributeData.toColorRGB(I2.getUnderlineColor()).join(",")})`;
              else {
                let e5 = I2.getUnderlineColor();
                this._optionsService.rawOptions.drawBoldTextInBrightColors && I2.isBold() && e5 < 8 && (e5 += 8), C2.style.textDecorationColor = S2.ansi[e5].css;
              }
              I2.isOverline() && (B2.push("xterm-overline"), " " === y2 && (y2 = " ")), I2.isStrikethrough() && B2.push("xterm-strikethrough"), W2 && (C2.style.textDecoration = "underline");
              let $2 = I2.getFgColor(), j2 = I2.getFgColorMode(), z2 = I2.getBgColor(), K2 = I2.getBgColorMode();
              const q2 = !!I2.isInverse();
              if (q2) {
                const e5 = $2;
                $2 = z2, z2 = e5;
                const t5 = j2;
                j2 = K2, K2 = t5;
              }
              let V2, G2, X2, J2 = false;
              switch (this._decorationService.forEachDecorationAtCell(M2, t4, void 0, ((e5) => {
                "top" !== e5.options.layer && J2 || (e5.backgroundColorRGB && (K2 = 50331648, z2 = e5.backgroundColorRGB.rgba >> 8 & 16777215, V2 = e5.backgroundColorRGB), e5.foregroundColorRGB && (j2 = 50331648, $2 = e5.foregroundColorRGB.rgba >> 8 & 16777215, G2 = e5.foregroundColorRGB), J2 = "top" === e5.options.layer);
              })), !J2 && H2 && (V2 = this._coreBrowserService.isFocused ? S2.selectionBackgroundOpaque : S2.selectionInactiveBackgroundOpaque, z2 = V2.rgba >> 8 & 16777215, K2 = 50331648, J2 = true, S2.selectionForeground && (j2 = 50331648, $2 = S2.selectionForeground.rgba >> 8 & 16777215, G2 = S2.selectionForeground)), J2 && B2.push("xterm-decoration-top"), K2) {
                case 16777216:
                case 33554432:
                  X2 = S2.ansi[z2], B2.push(`xterm-bg-${z2}`);
                  break;
                case 50331648:
                  X2 = c2.channels.toColor(z2 >> 16, z2 >> 8 & 255, 255 & z2), this._addStyle(C2, `background-color:#${v2((z2 >>> 0).toString(16), "0", 6)}`);
                  break;
                default:
                  q2 ? (X2 = S2.foreground, B2.push(`xterm-bg-${n2.INVERTED_DEFAULT_COLOR}`)) : X2 = S2.background;
              }
              switch (V2 || I2.isDim() && (V2 = c2.color.multiplyOpacity(X2, 0.5)), j2) {
                case 16777216:
                case 33554432:
                  I2.isBold() && $2 < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors && ($2 += 8), this._applyMinimumContrast(C2, X2, S2.ansi[$2], I2, V2, void 0) || B2.push(`xterm-fg-${$2}`);
                  break;
                case 50331648:
                  const e5 = c2.channels.toColor($2 >> 16 & 255, $2 >> 8 & 255, 255 & $2);
                  this._applyMinimumContrast(C2, X2, e5, I2, V2, G2) || this._addStyle(C2, `color:#${v2($2.toString(16), "0", 6)}`);
                  break;
                default:
                  this._applyMinimumContrast(C2, X2, S2.foreground, I2, V2, G2) || q2 && B2.push(`xterm-fg-${n2.INVERTED_DEFAULT_COLOR}`);
              }
              B2.length && (C2.className = B2.join(" "), B2.length = 0), F2 || O2 || U2 ? C2.textContent = y2 : w2++, A2 !== this.defaultSpacing && (C2.style.letterSpacing = `${A2}px`), g2.push(C2), M2 = P2;
            }
            return C2 && w2 && (C2.textContent = y2), g2;
          }
          _applyMinimumContrast(e4, t4, i4, s4, r3, n3) {
            if (1 === this._optionsService.rawOptions.minimumContrastRatio || (0, _2.treatGlyphAsBackgroundColor)(s4.getCode())) return false;
            const o3 = this._getContrastCache(s4);
            let a3;
            if (r3 || n3 || (a3 = o3.getColor(t4.rgba, i4.rgba)), void 0 === a3) {
              const e5 = this._optionsService.rawOptions.minimumContrastRatio / (s4.isDim() ? 2 : 1);
              a3 = c2.color.ensureContrastRatio(r3 || t4, n3 || i4, e5), o3.setColor((r3 || t4).rgba, (n3 || i4).rgba, a3 ?? null);
            }
            return !!a3 && (this._addStyle(e4, `color:${a3.css}`), true);
          }
          _getContrastCache(e4) {
            return e4.isDim() ? this._themeService.colors.halfContrastCache : this._themeService.colors.contrastCache;
          }
          _addStyle(e4, t4) {
            e4.setAttribute("style", `${e4.getAttribute("style") || ""}${t4};`);
          }
          _isCellInSelection(e4, t4) {
            const i4 = this._selectionStart, s4 = this._selectionEnd;
            return !(!i4 || !s4) && (this._columnSelectMode ? i4[0] <= s4[0] ? e4 >= i4[0] && t4 >= i4[1] && e4 < s4[0] && t4 <= s4[1] : e4 < i4[0] && t4 >= i4[1] && e4 >= s4[0] && t4 <= s4[1] : t4 > i4[1] && t4 < s4[1] || i4[1] === s4[1] && t4 === i4[1] && e4 >= i4[0] && e4 < s4[0] || i4[1] < s4[1] && t4 === s4[1] && e4 < s4[0] || i4[1] < s4[1] && t4 === i4[1] && e4 >= i4[0]);
          }
        };
        function v2(e4, t4, i4) {
          for (; e4.length < i4; ) e4 = t4 + e4;
          return e4;
        }
        t3.DomRendererRowFactory = f2 = s3([r2(1, l2.ICharacterJoinerService), r2(2, h2.IOptionsService), r2(3, l2.ICoreBrowserService), r2(4, h2.ICoreService), r2(5, h2.IDecorationService), r2(6, l2.IThemeService)], f2);
      }, 2550: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.WidthCache = void 0, t3.WidthCache = class {
          constructor(e4, t4) {
            this._flat = new Float32Array(256), this._font = "", this._fontSize = 0, this._weight = "normal", this._weightBold = "bold", this._measureElements = [], this._container = e4.createElement("div"), this._container.classList.add("xterm-width-cache-measure-container"), this._container.setAttribute("aria-hidden", "true"), this._container.style.whiteSpace = "pre", this._container.style.fontKerning = "none";
            const i3 = e4.createElement("span");
            i3.classList.add("xterm-char-measure-element");
            const s3 = e4.createElement("span");
            s3.classList.add("xterm-char-measure-element"), s3.style.fontWeight = "bold";
            const r2 = e4.createElement("span");
            r2.classList.add("xterm-char-measure-element"), r2.style.fontStyle = "italic";
            const n2 = e4.createElement("span");
            n2.classList.add("xterm-char-measure-element"), n2.style.fontWeight = "bold", n2.style.fontStyle = "italic", this._measureElements = [i3, s3, r2, n2], this._container.appendChild(i3), this._container.appendChild(s3), this._container.appendChild(r2), this._container.appendChild(n2), t4.appendChild(this._container), this.clear();
          }
          dispose() {
            this._container.remove(), this._measureElements.length = 0, this._holey = void 0;
          }
          clear() {
            this._flat.fill(-9999), this._holey = /* @__PURE__ */ new Map();
          }
          setFont(e4, t4, i3, s3) {
            e4 === this._font && t4 === this._fontSize && i3 === this._weight && s3 === this._weightBold || (this._font = e4, this._fontSize = t4, this._weight = i3, this._weightBold = s3, this._container.style.fontFamily = this._font, this._container.style.fontSize = `${this._fontSize}px`, this._measureElements[0].style.fontWeight = `${i3}`, this._measureElements[1].style.fontWeight = `${s3}`, this._measureElements[2].style.fontWeight = `${i3}`, this._measureElements[3].style.fontWeight = `${s3}`, this.clear());
          }
          get(e4, t4, i3) {
            let s3 = 0;
            if (!t4 && !i3 && 1 === e4.length && (s3 = e4.charCodeAt(0)) < 256) {
              if (-9999 !== this._flat[s3]) return this._flat[s3];
              const t5 = this._measure(e4, 0);
              return t5 > 0 && (this._flat[s3] = t5), t5;
            }
            let r2 = e4;
            t4 && (r2 += "B"), i3 && (r2 += "I");
            let n2 = this._holey.get(r2);
            if (void 0 === n2) {
              let s4 = 0;
              t4 && (s4 |= 1), i3 && (s4 |= 2), n2 = this._measure(e4, s4), n2 > 0 && this._holey.set(r2, n2);
            }
            return n2;
          }
          _measure(e4, t4) {
            const i3 = this._measureElements[t4];
            return i3.textContent = e4.repeat(32), i3.offsetWidth / 32;
          }
        };
      }, 2223: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.TEXT_BASELINE = t3.DIM_OPACITY = t3.INVERTED_DEFAULT_COLOR = void 0;
        const s3 = i3(6114);
        t3.INVERTED_DEFAULT_COLOR = 257, t3.DIM_OPACITY = 0.5, t3.TEXT_BASELINE = s3.isFirefox || s3.isLegacyEdge ? "bottom" : "ideographic";
      }, 6171: (e3, t3) => {
        function i3(e4) {
          return 57508 <= e4 && e4 <= 57558;
        }
        function s3(e4) {
          return e4 >= 128512 && e4 <= 128591 || e4 >= 127744 && e4 <= 128511 || e4 >= 128640 && e4 <= 128767 || e4 >= 9728 && e4 <= 9983 || e4 >= 9984 && e4 <= 10175 || e4 >= 65024 && e4 <= 65039 || e4 >= 129280 && e4 <= 129535 || e4 >= 127462 && e4 <= 127487;
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.computeNextVariantOffset = t3.createRenderDimensions = t3.treatGlyphAsBackgroundColor = t3.allowRescaling = t3.isEmoji = t3.isRestrictedPowerlineGlyph = t3.isPowerlineGlyph = t3.throwIfFalsy = void 0, t3.throwIfFalsy = function(e4) {
          if (!e4) throw new Error("value must not be falsy");
          return e4;
        }, t3.isPowerlineGlyph = i3, t3.isRestrictedPowerlineGlyph = function(e4) {
          return 57520 <= e4 && e4 <= 57527;
        }, t3.isEmoji = s3, t3.allowRescaling = function(e4, t4, r2, n2) {
          return 1 === t4 && r2 > Math.ceil(1.5 * n2) && void 0 !== e4 && e4 > 255 && !s3(e4) && !i3(e4) && !(function(e5) {
            return 57344 <= e5 && e5 <= 63743;
          })(e4);
        }, t3.treatGlyphAsBackgroundColor = function(e4) {
          return i3(e4) || (function(e5) {
            return 9472 <= e5 && e5 <= 9631;
          })(e4);
        }, t3.createRenderDimensions = function() {
          return { css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } }, device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } } };
        }, t3.computeNextVariantOffset = function(e4, t4, i4 = 0) {
          return (e4 - (2 * Math.round(t4) - i4)) % (2 * Math.round(t4));
        };
      }, 6052: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.createSelectionRenderModel = void 0;
        class i3 {
          constructor() {
            this.clear();
          }
          clear() {
            this.hasSelection = false, this.columnSelectMode = false, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
          }
          update(e4, t4, i4, s3 = false) {
            if (this.selectionStart = t4, this.selectionEnd = i4, !t4 || !i4 || t4[0] === i4[0] && t4[1] === i4[1]) return void this.clear();
            const r2 = e4.buffers.active.ydisp, n2 = t4[1] - r2, o2 = i4[1] - r2, a2 = Math.max(n2, 0), h2 = Math.min(o2, e4.rows - 1);
            a2 >= e4.rows || h2 < 0 ? this.clear() : (this.hasSelection = true, this.columnSelectMode = s3, this.viewportStartRow = n2, this.viewportEndRow = o2, this.viewportCappedStartRow = a2, this.viewportCappedEndRow = h2, this.startCol = t4[0], this.endCol = i4[0]);
          }
          isCellSelected(e4, t4, i4) {
            return !!this.hasSelection && (i4 -= e4.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? t4 >= this.startCol && i4 >= this.viewportCappedStartRow && t4 < this.endCol && i4 <= this.viewportCappedEndRow : t4 < this.startCol && i4 >= this.viewportCappedStartRow && t4 >= this.endCol && i4 <= this.viewportCappedEndRow : i4 > this.viewportStartRow && i4 < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && i4 === this.viewportStartRow && t4 >= this.startCol && t4 < this.endCol || this.viewportStartRow < this.viewportEndRow && i4 === this.viewportEndRow && t4 < this.endCol || this.viewportStartRow < this.viewportEndRow && i4 === this.viewportStartRow && t4 >= this.startCol);
          }
        }
        t3.createSelectionRenderModel = function() {
          return new i3();
        };
      }, 456: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.SelectionModel = void 0, t3.SelectionModel = class {
          constructor(e4) {
            this._bufferService = e4, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          clearSelection() {
            this.selectionStart = void 0, this.selectionEnd = void 0, this.isSelectAllActive = false, this.selectionStartLength = 0;
          }
          get finalSelectionStart() {
            return this.isSelectAllActive ? [0, 0] : this.selectionEnd && this.selectionStart && this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
          }
          get finalSelectionEnd() {
            if (this.isSelectAllActive) return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            if (this.selectionStart) {
              if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                const e4 = this.selectionStart[0] + this.selectionStartLength;
                return e4 > this._bufferService.cols ? e4 % this._bufferService.cols == 0 ? [this._bufferService.cols, this.selectionStart[1] + Math.floor(e4 / this._bufferService.cols) - 1] : [e4 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e4 / this._bufferService.cols)] : [e4, this.selectionStart[1]];
              }
              if (this.selectionStartLength && this.selectionEnd[1] === this.selectionStart[1]) {
                const e4 = this.selectionStart[0] + this.selectionStartLength;
                return e4 > this._bufferService.cols ? [e4 % this._bufferService.cols, this.selectionStart[1] + Math.floor(e4 / this._bufferService.cols)] : [Math.max(e4, this.selectionEnd[0]), this.selectionEnd[1]];
              }
              return this.selectionEnd;
            }
          }
          areSelectionValuesReversed() {
            const e4 = this.selectionStart, t4 = this.selectionEnd;
            return !(!e4 || !t4) && (e4[1] > t4[1] || e4[1] === t4[1] && e4[0] > t4[0]);
          }
          handleTrim(e4) {
            return this.selectionStart && (this.selectionStart[1] -= e4), this.selectionEnd && (this.selectionEnd[1] -= e4), this.selectionEnd && this.selectionEnd[1] < 0 ? (this.clearSelection(), true) : (this.selectionStart && this.selectionStart[1] < 0 && (this.selectionStart[1] = 0), false);
          }
        };
      }, 428: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CharSizeService = void 0;
        const n2 = i3(2585), o2 = i3(8460), a2 = i3(844);
        let h2 = t3.CharSizeService = class extends a2.Disposable {
          get hasValidSize() {
            return this.width > 0 && this.height > 0;
          }
          constructor(e4, t4, i4) {
            super(), this._optionsService = i4, this.width = 0, this.height = 0, this._onCharSizeChange = this.register(new o2.EventEmitter()), this.onCharSizeChange = this._onCharSizeChange.event;
            try {
              this._measureStrategy = this.register(new d2(this._optionsService));
            } catch {
              this._measureStrategy = this.register(new l2(e4, t4, this._optionsService));
            }
            this.register(this._optionsService.onMultipleOptionChange(["fontFamily", "fontSize"], (() => this.measure())));
          }
          measure() {
            const e4 = this._measureStrategy.measure();
            e4.width === this.width && e4.height === this.height || (this.width = e4.width, this.height = e4.height, this._onCharSizeChange.fire());
          }
        };
        t3.CharSizeService = h2 = s3([r2(2, n2.IOptionsService)], h2);
        class c2 extends a2.Disposable {
          constructor() {
            super(...arguments), this._result = { width: 0, height: 0 };
          }
          _validateAndSet(e4, t4) {
            void 0 !== e4 && e4 > 0 && void 0 !== t4 && t4 > 0 && (this._result.width = e4, this._result.height = t4);
          }
        }
        class l2 extends c2 {
          constructor(e4, t4, i4) {
            super(), this._document = e4, this._parentElement = t4, this._optionsService = i4, this._measureElement = this._document.createElement("span"), this._measureElement.classList.add("xterm-char-measure-element"), this._measureElement.textContent = "W".repeat(32), this._measureElement.setAttribute("aria-hidden", "true"), this._measureElement.style.whiteSpace = "pre", this._measureElement.style.fontKerning = "none", this._parentElement.appendChild(this._measureElement);
          }
          measure() {
            return this._measureElement.style.fontFamily = this._optionsService.rawOptions.fontFamily, this._measureElement.style.fontSize = `${this._optionsService.rawOptions.fontSize}px`, this._validateAndSet(Number(this._measureElement.offsetWidth) / 32, Number(this._measureElement.offsetHeight)), this._result;
          }
        }
        class d2 extends c2 {
          constructor(e4) {
            super(), this._optionsService = e4, this._canvas = new OffscreenCanvas(100, 100), this._ctx = this._canvas.getContext("2d");
            const t4 = this._ctx.measureText("W");
            if (!("width" in t4 && "fontBoundingBoxAscent" in t4 && "fontBoundingBoxDescent" in t4)) throw new Error("Required font metrics not supported");
          }
          measure() {
            this._ctx.font = `${this._optionsService.rawOptions.fontSize}px ${this._optionsService.rawOptions.fontFamily}`;
            const e4 = this._ctx.measureText("W");
            return this._validateAndSet(e4.width, e4.fontBoundingBoxAscent + e4.fontBoundingBoxDescent), this._result;
          }
        }
      }, 4269: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CharacterJoinerService = t3.JoinedCellData = void 0;
        const n2 = i3(3734), o2 = i3(643), a2 = i3(511), h2 = i3(2585);
        class c2 extends n2.AttributeData {
          constructor(e4, t4, i4) {
            super(), this.content = 0, this.combinedData = "", this.fg = e4.fg, this.bg = e4.bg, this.combinedData = t4, this._width = i4;
          }
          isCombined() {
            return 2097152;
          }
          getWidth() {
            return this._width;
          }
          getChars() {
            return this.combinedData;
          }
          getCode() {
            return 2097151;
          }
          setFromCharData(e4) {
            throw new Error("not implemented");
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t3.JoinedCellData = c2;
        let l2 = t3.CharacterJoinerService = class e4 {
          constructor(e5) {
            this._bufferService = e5, this._characterJoiners = [], this._nextCharacterJoinerId = 0, this._workCell = new a2.CellData();
          }
          register(e5) {
            const t4 = { id: this._nextCharacterJoinerId++, handler: e5 };
            return this._characterJoiners.push(t4), t4.id;
          }
          deregister(e5) {
            for (let t4 = 0; t4 < this._characterJoiners.length; t4++) if (this._characterJoiners[t4].id === e5) return this._characterJoiners.splice(t4, 1), true;
            return false;
          }
          getJoinedCharacters(e5) {
            if (0 === this._characterJoiners.length) return [];
            const t4 = this._bufferService.buffer.lines.get(e5);
            if (!t4 || 0 === t4.length) return [];
            const i4 = [], s4 = t4.translateToString(true);
            let r3 = 0, n3 = 0, a3 = 0, h3 = t4.getFg(0), c3 = t4.getBg(0);
            for (let e6 = 0; e6 < t4.getTrimmedLength(); e6++) if (t4.loadCell(e6, this._workCell), 0 !== this._workCell.getWidth()) {
              if (this._workCell.fg !== h3 || this._workCell.bg !== c3) {
                if (e6 - r3 > 1) {
                  const e7 = this._getJoinedRanges(s4, a3, n3, t4, r3);
                  for (let t5 = 0; t5 < e7.length; t5++) i4.push(e7[t5]);
                }
                r3 = e6, a3 = n3, h3 = this._workCell.fg, c3 = this._workCell.bg;
              }
              n3 += this._workCell.getChars().length || o2.WHITESPACE_CELL_CHAR.length;
            }
            if (this._bufferService.cols - r3 > 1) {
              const e6 = this._getJoinedRanges(s4, a3, n3, t4, r3);
              for (let t5 = 0; t5 < e6.length; t5++) i4.push(e6[t5]);
            }
            return i4;
          }
          _getJoinedRanges(t4, i4, s4, r3, n3) {
            const o3 = t4.substring(i4, s4);
            let a3 = [];
            try {
              a3 = this._characterJoiners[0].handler(o3);
            } catch (e5) {
              console.error(e5);
            }
            for (let t5 = 1; t5 < this._characterJoiners.length; t5++) try {
              const i5 = this._characterJoiners[t5].handler(o3);
              for (let t6 = 0; t6 < i5.length; t6++) e4._mergeRanges(a3, i5[t6]);
            } catch (e5) {
              console.error(e5);
            }
            return this._stringRangesToCellRanges(a3, r3, n3), a3;
          }
          _stringRangesToCellRanges(e5, t4, i4) {
            let s4 = 0, r3 = false, n3 = 0, a3 = e5[s4];
            if (a3) {
              for (let h3 = i4; h3 < this._bufferService.cols; h3++) {
                const i5 = t4.getWidth(h3), c3 = t4.getString(h3).length || o2.WHITESPACE_CELL_CHAR.length;
                if (0 !== i5) {
                  if (!r3 && a3[0] <= n3 && (a3[0] = h3, r3 = true), a3[1] <= n3) {
                    if (a3[1] = h3, a3 = e5[++s4], !a3) break;
                    a3[0] <= n3 ? (a3[0] = h3, r3 = true) : r3 = false;
                  }
                  n3 += c3;
                }
              }
              a3 && (a3[1] = this._bufferService.cols);
            }
          }
          static _mergeRanges(e5, t4) {
            let i4 = false;
            for (let s4 = 0; s4 < e5.length; s4++) {
              const r3 = e5[s4];
              if (i4) {
                if (t4[1] <= r3[0]) return e5[s4 - 1][1] = t4[1], e5;
                if (t4[1] <= r3[1]) return e5[s4 - 1][1] = Math.max(t4[1], r3[1]), e5.splice(s4, 1), e5;
                e5.splice(s4, 1), s4--;
              } else {
                if (t4[1] <= r3[0]) return e5.splice(s4, 0, t4), e5;
                if (t4[1] <= r3[1]) return r3[0] = Math.min(t4[0], r3[0]), e5;
                t4[0] < r3[1] && (r3[0] = Math.min(t4[0], r3[0]), i4 = true);
              }
            }
            return i4 ? e5[e5.length - 1][1] = t4[1] : e5.push(t4), e5;
          }
        };
        t3.CharacterJoinerService = l2 = s3([r2(0, h2.IBufferService)], l2);
      }, 5114: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CoreBrowserService = void 0;
        const s3 = i3(844), r2 = i3(8460), n2 = i3(3656);
        class o2 extends s3.Disposable {
          constructor(e4, t4, i4) {
            super(), this._textarea = e4, this._window = t4, this.mainDocument = i4, this._isFocused = false, this._cachedIsFocused = void 0, this._screenDprMonitor = new a2(this._window), this._onDprChange = this.register(new r2.EventEmitter()), this.onDprChange = this._onDprChange.event, this._onWindowChange = this.register(new r2.EventEmitter()), this.onWindowChange = this._onWindowChange.event, this.register(this.onWindowChange(((e5) => this._screenDprMonitor.setWindow(e5)))), this.register((0, r2.forwardEvent)(this._screenDprMonitor.onDprChange, this._onDprChange)), this._textarea.addEventListener("focus", (() => this._isFocused = true)), this._textarea.addEventListener("blur", (() => this._isFocused = false));
          }
          get window() {
            return this._window;
          }
          set window(e4) {
            this._window !== e4 && (this._window = e4, this._onWindowChange.fire(this._window));
          }
          get dpr() {
            return this.window.devicePixelRatio;
          }
          get isFocused() {
            return void 0 === this._cachedIsFocused && (this._cachedIsFocused = this._isFocused && this._textarea.ownerDocument.hasFocus(), queueMicrotask((() => this._cachedIsFocused = void 0))), this._cachedIsFocused;
          }
        }
        t3.CoreBrowserService = o2;
        class a2 extends s3.Disposable {
          constructor(e4) {
            super(), this._parentWindow = e4, this._windowResizeListener = this.register(new s3.MutableDisposable()), this._onDprChange = this.register(new r2.EventEmitter()), this.onDprChange = this._onDprChange.event, this._outerListener = () => this._setDprAndFireIfDiffers(), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._updateDpr(), this._setWindowResizeListener(), this.register((0, s3.toDisposable)((() => this.clearListener())));
          }
          setWindow(e4) {
            this._parentWindow = e4, this._setWindowResizeListener(), this._setDprAndFireIfDiffers();
          }
          _setWindowResizeListener() {
            this._windowResizeListener.value = (0, n2.addDisposableDomListener)(this._parentWindow, "resize", (() => this._setDprAndFireIfDiffers()));
          }
          _setDprAndFireIfDiffers() {
            this._parentWindow.devicePixelRatio !== this._currentDevicePixelRatio && this._onDprChange.fire(this._parentWindow.devicePixelRatio), this._updateDpr();
          }
          _updateDpr() {
            this._outerListener && (this._resolutionMediaMatchList?.removeListener(this._outerListener), this._currentDevicePixelRatio = this._parentWindow.devicePixelRatio, this._resolutionMediaMatchList = this._parentWindow.matchMedia(`screen and (resolution: ${this._parentWindow.devicePixelRatio}dppx)`), this._resolutionMediaMatchList.addListener(this._outerListener));
          }
          clearListener() {
            this._resolutionMediaMatchList && this._outerListener && (this._resolutionMediaMatchList.removeListener(this._outerListener), this._resolutionMediaMatchList = void 0, this._outerListener = void 0);
          }
        }
      }, 779: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.LinkProviderService = void 0;
        const s3 = i3(844);
        class r2 extends s3.Disposable {
          constructor() {
            super(), this.linkProviders = [], this.register((0, s3.toDisposable)((() => this.linkProviders.length = 0)));
          }
          registerLinkProvider(e4) {
            return this.linkProviders.push(e4), { dispose: () => {
              const t4 = this.linkProviders.indexOf(e4);
              -1 !== t4 && this.linkProviders.splice(t4, 1);
            } };
          }
        }
        t3.LinkProviderService = r2;
      }, 8934: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.MouseService = void 0;
        const n2 = i3(4725), o2 = i3(9806);
        let a2 = t3.MouseService = class {
          constructor(e4, t4) {
            this._renderService = e4, this._charSizeService = t4;
          }
          getCoords(e4, t4, i4, s4, r3) {
            return (0, o2.getCoords)(window, e4, t4, i4, s4, this._charSizeService.hasValidSize, this._renderService.dimensions.css.cell.width, this._renderService.dimensions.css.cell.height, r3);
          }
          getMouseReportCoords(e4, t4) {
            const i4 = (0, o2.getCoordsRelativeToElement)(window, e4, t4);
            if (this._charSizeService.hasValidSize) return i4[0] = Math.min(Math.max(i4[0], 0), this._renderService.dimensions.css.canvas.width - 1), i4[1] = Math.min(Math.max(i4[1], 0), this._renderService.dimensions.css.canvas.height - 1), { col: Math.floor(i4[0] / this._renderService.dimensions.css.cell.width), row: Math.floor(i4[1] / this._renderService.dimensions.css.cell.height), x: Math.floor(i4[0]), y: Math.floor(i4[1]) };
          }
        };
        t3.MouseService = a2 = s3([r2(0, n2.IRenderService), r2(1, n2.ICharSizeService)], a2);
      }, 3230: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.RenderService = void 0;
        const n2 = i3(6193), o2 = i3(4725), a2 = i3(8460), h2 = i3(844), c2 = i3(7226), l2 = i3(2585);
        let d2 = t3.RenderService = class extends h2.Disposable {
          get dimensions() {
            return this._renderer.value.dimensions;
          }
          constructor(e4, t4, i4, s4, r3, o3, l3, d3) {
            super(), this._rowCount = e4, this._charSizeService = s4, this._renderer = this.register(new h2.MutableDisposable()), this._pausedResizeTask = new c2.DebouncedIdleTask(), this._observerDisposable = this.register(new h2.MutableDisposable()), this._isPaused = false, this._needsFullRefresh = false, this._isNextRenderRedrawOnly = true, this._needsSelectionRefresh = false, this._canvasWidth = 0, this._canvasHeight = 0, this._selectionState = { start: void 0, end: void 0, columnSelectMode: false }, this._onDimensionsChange = this.register(new a2.EventEmitter()), this.onDimensionsChange = this._onDimensionsChange.event, this._onRenderedViewportChange = this.register(new a2.EventEmitter()), this.onRenderedViewportChange = this._onRenderedViewportChange.event, this._onRender = this.register(new a2.EventEmitter()), this.onRender = this._onRender.event, this._onRefreshRequest = this.register(new a2.EventEmitter()), this.onRefreshRequest = this._onRefreshRequest.event, this._renderDebouncer = new n2.RenderDebouncer(((e5, t5) => this._renderRows(e5, t5)), l3), this.register(this._renderDebouncer), this.register(l3.onDprChange((() => this.handleDevicePixelRatioChange()))), this.register(o3.onResize((() => this._fullRefresh()))), this.register(o3.buffers.onBufferActivate((() => this._renderer.value?.clear()))), this.register(i4.onOptionChange((() => this._handleOptionsChanged()))), this.register(this._charSizeService.onCharSizeChange((() => this.handleCharSizeChanged()))), this.register(r3.onDecorationRegistered((() => this._fullRefresh()))), this.register(r3.onDecorationRemoved((() => this._fullRefresh()))), this.register(i4.onMultipleOptionChange(["customGlyphs", "drawBoldTextInBrightColors", "letterSpacing", "lineHeight", "fontFamily", "fontSize", "fontWeight", "fontWeightBold", "minimumContrastRatio", "rescaleOverlappingGlyphs"], (() => {
              this.clear(), this.handleResize(o3.cols, o3.rows), this._fullRefresh();
            }))), this.register(i4.onMultipleOptionChange(["cursorBlink", "cursorStyle"], (() => this.refreshRows(o3.buffer.y, o3.buffer.y, true)))), this.register(d3.onChangeColors((() => this._fullRefresh()))), this._registerIntersectionObserver(l3.window, t4), this.register(l3.onWindowChange(((e5) => this._registerIntersectionObserver(e5, t4))));
          }
          _registerIntersectionObserver(e4, t4) {
            if ("IntersectionObserver" in e4) {
              const i4 = new e4.IntersectionObserver(((e5) => this._handleIntersectionChange(e5[e5.length - 1])), { threshold: 0 });
              i4.observe(t4), this._observerDisposable.value = (0, h2.toDisposable)((() => i4.disconnect()));
            }
          }
          _handleIntersectionChange(e4) {
            this._isPaused = void 0 === e4.isIntersecting ? 0 === e4.intersectionRatio : !e4.isIntersecting, this._isPaused || this._charSizeService.hasValidSize || this._charSizeService.measure(), !this._isPaused && this._needsFullRefresh && (this._pausedResizeTask.flush(), this.refreshRows(0, this._rowCount - 1), this._needsFullRefresh = false);
          }
          refreshRows(e4, t4, i4 = false) {
            this._isPaused ? this._needsFullRefresh = true : (i4 || (this._isNextRenderRedrawOnly = false), this._renderDebouncer.refresh(e4, t4, this._rowCount));
          }
          _renderRows(e4, t4) {
            this._renderer.value && (e4 = Math.min(e4, this._rowCount - 1), t4 = Math.min(t4, this._rowCount - 1), this._renderer.value.renderRows(e4, t4), this._needsSelectionRefresh && (this._renderer.value.handleSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode), this._needsSelectionRefresh = false), this._isNextRenderRedrawOnly || this._onRenderedViewportChange.fire({ start: e4, end: t4 }), this._onRender.fire({ start: e4, end: t4 }), this._isNextRenderRedrawOnly = true);
          }
          resize(e4, t4) {
            this._rowCount = t4, this._fireOnCanvasResize();
          }
          _handleOptionsChanged() {
            this._renderer.value && (this.refreshRows(0, this._rowCount - 1), this._fireOnCanvasResize());
          }
          _fireOnCanvasResize() {
            this._renderer.value && (this._renderer.value.dimensions.css.canvas.width === this._canvasWidth && this._renderer.value.dimensions.css.canvas.height === this._canvasHeight || this._onDimensionsChange.fire(this._renderer.value.dimensions));
          }
          hasRenderer() {
            return !!this._renderer.value;
          }
          setRenderer(e4) {
            this._renderer.value = e4, this._renderer.value && (this._renderer.value.onRequestRedraw(((e5) => this.refreshRows(e5.start, e5.end, true))), this._needsSelectionRefresh = true, this._fullRefresh());
          }
          addRefreshCallback(e4) {
            return this._renderDebouncer.addRefreshCallback(e4);
          }
          _fullRefresh() {
            this._isPaused ? this._needsFullRefresh = true : this.refreshRows(0, this._rowCount - 1);
          }
          clearTextureAtlas() {
            this._renderer.value && (this._renderer.value.clearTextureAtlas?.(), this._fullRefresh());
          }
          handleDevicePixelRatioChange() {
            this._charSizeService.measure(), this._renderer.value && (this._renderer.value.handleDevicePixelRatioChange(), this.refreshRows(0, this._rowCount - 1));
          }
          handleResize(e4, t4) {
            this._renderer.value && (this._isPaused ? this._pausedResizeTask.set((() => this._renderer.value?.handleResize(e4, t4))) : this._renderer.value.handleResize(e4, t4), this._fullRefresh());
          }
          handleCharSizeChanged() {
            this._renderer.value?.handleCharSizeChanged();
          }
          handleBlur() {
            this._renderer.value?.handleBlur();
          }
          handleFocus() {
            this._renderer.value?.handleFocus();
          }
          handleSelectionChanged(e4, t4, i4) {
            this._selectionState.start = e4, this._selectionState.end = t4, this._selectionState.columnSelectMode = i4, this._renderer.value?.handleSelectionChanged(e4, t4, i4);
          }
          handleCursorMove() {
            this._renderer.value?.handleCursorMove();
          }
          clear() {
            this._renderer.value?.clear();
          }
        };
        t3.RenderService = d2 = s3([r2(2, l2.IOptionsService), r2(3, o2.ICharSizeService), r2(4, l2.IDecorationService), r2(5, l2.IBufferService), r2(6, o2.ICoreBrowserService), r2(7, o2.IThemeService)], d2);
      }, 9312: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.SelectionService = void 0;
        const n2 = i3(9806), o2 = i3(9504), a2 = i3(456), h2 = i3(4725), c2 = i3(8460), l2 = i3(844), d2 = i3(6114), _2 = i3(4841), u2 = i3(511), f2 = i3(2585), v2 = String.fromCharCode(160), p2 = new RegExp(v2, "g");
        let g2 = t3.SelectionService = class extends l2.Disposable {
          constructor(e4, t4, i4, s4, r3, n3, o3, h3, d3) {
            super(), this._element = e4, this._screenElement = t4, this._linkifier = i4, this._bufferService = s4, this._coreService = r3, this._mouseService = n3, this._optionsService = o3, this._renderService = h3, this._coreBrowserService = d3, this._dragScrollAmount = 0, this._enabled = true, this._workCell = new u2.CellData(), this._mouseDownTimeStamp = 0, this._oldHasSelection = false, this._oldSelectionStart = void 0, this._oldSelectionEnd = void 0, this._onLinuxMouseSelection = this.register(new c2.EventEmitter()), this.onLinuxMouseSelection = this._onLinuxMouseSelection.event, this._onRedrawRequest = this.register(new c2.EventEmitter()), this.onRequestRedraw = this._onRedrawRequest.event, this._onSelectionChange = this.register(new c2.EventEmitter()), this.onSelectionChange = this._onSelectionChange.event, this._onRequestScrollLines = this.register(new c2.EventEmitter()), this.onRequestScrollLines = this._onRequestScrollLines.event, this._mouseMoveListener = (e5) => this._handleMouseMove(e5), this._mouseUpListener = (e5) => this._handleMouseUp(e5), this._coreService.onUserInput((() => {
              this.hasSelection && this.clearSelection();
            })), this._trimListener = this._bufferService.buffer.lines.onTrim(((e5) => this._handleTrim(e5))), this.register(this._bufferService.buffers.onBufferActivate(((e5) => this._handleBufferActivate(e5)))), this.enable(), this._model = new a2.SelectionModel(this._bufferService), this._activeSelectionMode = 0, this.register((0, l2.toDisposable)((() => {
              this._removeMouseDownListeners();
            })));
          }
          reset() {
            this.clearSelection();
          }
          disable() {
            this.clearSelection(), this._enabled = false;
          }
          enable() {
            this._enabled = true;
          }
          get selectionStart() {
            return this._model.finalSelectionStart;
          }
          get selectionEnd() {
            return this._model.finalSelectionEnd;
          }
          get hasSelection() {
            const e4 = this._model.finalSelectionStart, t4 = this._model.finalSelectionEnd;
            return !(!e4 || !t4 || e4[0] === t4[0] && e4[1] === t4[1]);
          }
          get selectionText() {
            const e4 = this._model.finalSelectionStart, t4 = this._model.finalSelectionEnd;
            if (!e4 || !t4) return "";
            const i4 = this._bufferService.buffer, s4 = [];
            if (3 === this._activeSelectionMode) {
              if (e4[0] === t4[0]) return "";
              const r3 = e4[0] < t4[0] ? e4[0] : t4[0], n3 = e4[0] < t4[0] ? t4[0] : e4[0];
              for (let o3 = e4[1]; o3 <= t4[1]; o3++) {
                const e5 = i4.translateBufferLineToString(o3, true, r3, n3);
                s4.push(e5);
              }
            } else {
              const r3 = e4[1] === t4[1] ? t4[0] : void 0;
              s4.push(i4.translateBufferLineToString(e4[1], true, e4[0], r3));
              for (let r4 = e4[1] + 1; r4 <= t4[1] - 1; r4++) {
                const e5 = i4.lines.get(r4), t5 = i4.translateBufferLineToString(r4, true);
                e5?.isWrapped ? s4[s4.length - 1] += t5 : s4.push(t5);
              }
              if (e4[1] !== t4[1]) {
                const e5 = i4.lines.get(t4[1]), r4 = i4.translateBufferLineToString(t4[1], true, 0, t4[0]);
                e5 && e5.isWrapped ? s4[s4.length - 1] += r4 : s4.push(r4);
              }
            }
            return s4.map(((e5) => e5.replace(p2, " "))).join(d2.isWindows ? "\r\n" : "\n");
          }
          clearSelection() {
            this._model.clearSelection(), this._removeMouseDownListeners(), this.refresh(), this._onSelectionChange.fire();
          }
          refresh(e4) {
            this._refreshAnimationFrame || (this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame((() => this._refresh()))), d2.isLinux && e4 && this.selectionText.length && this._onLinuxMouseSelection.fire(this.selectionText);
          }
          _refresh() {
            this._refreshAnimationFrame = void 0, this._onRedrawRequest.fire({ start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd, columnSelectMode: 3 === this._activeSelectionMode });
          }
          _isClickInSelection(e4) {
            const t4 = this._getMouseBufferCoords(e4), i4 = this._model.finalSelectionStart, s4 = this._model.finalSelectionEnd;
            return !!(i4 && s4 && t4) && this._areCoordsInSelection(t4, i4, s4);
          }
          isCellInSelection(e4, t4) {
            const i4 = this._model.finalSelectionStart, s4 = this._model.finalSelectionEnd;
            return !(!i4 || !s4) && this._areCoordsInSelection([e4, t4], i4, s4);
          }
          _areCoordsInSelection(e4, t4, i4) {
            return e4[1] > t4[1] && e4[1] < i4[1] || t4[1] === i4[1] && e4[1] === t4[1] && e4[0] >= t4[0] && e4[0] < i4[0] || t4[1] < i4[1] && e4[1] === i4[1] && e4[0] < i4[0] || t4[1] < i4[1] && e4[1] === t4[1] && e4[0] >= t4[0];
          }
          _selectWordAtCursor(e4, t4) {
            const i4 = this._linkifier.currentLink?.link?.range;
            if (i4) return this._model.selectionStart = [i4.start.x - 1, i4.start.y - 1], this._model.selectionStartLength = (0, _2.getRangeLength)(i4, this._bufferService.cols), this._model.selectionEnd = void 0, true;
            const s4 = this._getMouseBufferCoords(e4);
            return !!s4 && (this._selectWordAt(s4, t4), this._model.selectionEnd = void 0, true);
          }
          selectAll() {
            this._model.isSelectAllActive = true, this.refresh(), this._onSelectionChange.fire();
          }
          selectLines(e4, t4) {
            this._model.clearSelection(), e4 = Math.max(e4, 0), t4 = Math.min(t4, this._bufferService.buffer.lines.length - 1), this._model.selectionStart = [0, e4], this._model.selectionEnd = [this._bufferService.cols, t4], this.refresh(), this._onSelectionChange.fire();
          }
          _handleTrim(e4) {
            this._model.handleTrim(e4) && this.refresh();
          }
          _getMouseBufferCoords(e4) {
            const t4 = this._mouseService.getCoords(e4, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
            if (t4) return t4[0]--, t4[1]--, t4[1] += this._bufferService.buffer.ydisp, t4;
          }
          _getMouseEventScrollAmount(e4) {
            let t4 = (0, n2.getCoordsRelativeToElement)(this._coreBrowserService.window, e4, this._screenElement)[1];
            const i4 = this._renderService.dimensions.css.canvas.height;
            return t4 >= 0 && t4 <= i4 ? 0 : (t4 > i4 && (t4 -= i4), t4 = Math.min(Math.max(t4, -50), 50), t4 /= 50, t4 / Math.abs(t4) + Math.round(14 * t4));
          }
          shouldForceSelection(e4) {
            return d2.isMac ? e4.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection : e4.shiftKey;
          }
          handleMouseDown(e4) {
            if (this._mouseDownTimeStamp = e4.timeStamp, (2 !== e4.button || !this.hasSelection) && 0 === e4.button) {
              if (!this._enabled) {
                if (!this.shouldForceSelection(e4)) return;
                e4.stopPropagation();
              }
              e4.preventDefault(), this._dragScrollAmount = 0, this._enabled && e4.shiftKey ? this._handleIncrementalClick(e4) : 1 === e4.detail ? this._handleSingleClick(e4) : 2 === e4.detail ? this._handleDoubleClick(e4) : 3 === e4.detail && this._handleTripleClick(e4), this._addMouseDownListeners(), this.refresh(true);
            }
          }
          _addMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.addEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.addEventListener("mouseup", this._mouseUpListener)), this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval((() => this._dragScroll()), 50);
          }
          _removeMouseDownListeners() {
            this._screenElement.ownerDocument && (this._screenElement.ownerDocument.removeEventListener("mousemove", this._mouseMoveListener), this._screenElement.ownerDocument.removeEventListener("mouseup", this._mouseUpListener)), this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer), this._dragScrollIntervalTimer = void 0;
          }
          _handleIncrementalClick(e4) {
            this._model.selectionStart && (this._model.selectionEnd = this._getMouseBufferCoords(e4));
          }
          _handleSingleClick(e4) {
            if (this._model.selectionStartLength = 0, this._model.isSelectAllActive = false, this._activeSelectionMode = this.shouldColumnSelect(e4) ? 3 : 0, this._model.selectionStart = this._getMouseBufferCoords(e4), !this._model.selectionStart) return;
            this._model.selectionEnd = void 0;
            const t4 = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
            t4 && t4.length !== this._model.selectionStart[0] && 0 === t4.hasWidth(this._model.selectionStart[0]) && this._model.selectionStart[0]++;
          }
          _handleDoubleClick(e4) {
            this._selectWordAtCursor(e4, true) && (this._activeSelectionMode = 1);
          }
          _handleTripleClick(e4) {
            const t4 = this._getMouseBufferCoords(e4);
            t4 && (this._activeSelectionMode = 2, this._selectLineAt(t4[1]));
          }
          shouldColumnSelect(e4) {
            return e4.altKey && !(d2.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
          }
          _handleMouseMove(e4) {
            if (e4.stopImmediatePropagation(), !this._model.selectionStart) return;
            const t4 = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
            if (this._model.selectionEnd = this._getMouseBufferCoords(e4), !this._model.selectionEnd) return void this.refresh(true);
            2 === this._activeSelectionMode ? this._model.selectionEnd[1] < this._model.selectionStart[1] ? this._model.selectionEnd[0] = 0 : this._model.selectionEnd[0] = this._bufferService.cols : 1 === this._activeSelectionMode && this._selectToWordAt(this._model.selectionEnd), this._dragScrollAmount = this._getMouseEventScrollAmount(e4), 3 !== this._activeSelectionMode && (this._dragScrollAmount > 0 ? this._model.selectionEnd[0] = this._bufferService.cols : this._dragScrollAmount < 0 && (this._model.selectionEnd[0] = 0));
            const i4 = this._bufferService.buffer;
            if (this._model.selectionEnd[1] < i4.lines.length) {
              const e5 = i4.lines.get(this._model.selectionEnd[1]);
              e5 && 0 === e5.hasWidth(this._model.selectionEnd[0]) && this._model.selectionEnd[0] < this._bufferService.cols && this._model.selectionEnd[0]++;
            }
            t4 && t4[0] === this._model.selectionEnd[0] && t4[1] === this._model.selectionEnd[1] || this.refresh(true);
          }
          _dragScroll() {
            if (this._model.selectionEnd && this._model.selectionStart && this._dragScrollAmount) {
              this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
              const e4 = this._bufferService.buffer;
              this._dragScrollAmount > 0 ? (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = this._bufferService.cols), this._model.selectionEnd[1] = Math.min(e4.ydisp + this._bufferService.rows, e4.lines.length - 1)) : (3 !== this._activeSelectionMode && (this._model.selectionEnd[0] = 0), this._model.selectionEnd[1] = e4.ydisp), this.refresh();
            }
          }
          _handleMouseUp(e4) {
            const t4 = e4.timeStamp - this._mouseDownTimeStamp;
            if (this._removeMouseDownListeners(), this.selectionText.length <= 1 && t4 < 500 && e4.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
              if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                const t5 = this._mouseService.getCoords(e4, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (t5 && void 0 !== t5[0] && void 0 !== t5[1]) {
                  const e5 = (0, o2.moveToCellSequence)(t5[0] - 1, t5[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                  this._coreService.triggerDataEvent(e5, true);
                }
              }
            } else this._fireEventIfSelectionChanged();
          }
          _fireEventIfSelectionChanged() {
            const e4 = this._model.finalSelectionStart, t4 = this._model.finalSelectionEnd, i4 = !(!e4 || !t4 || e4[0] === t4[0] && e4[1] === t4[1]);
            i4 ? e4 && t4 && (this._oldSelectionStart && this._oldSelectionEnd && e4[0] === this._oldSelectionStart[0] && e4[1] === this._oldSelectionStart[1] && t4[0] === this._oldSelectionEnd[0] && t4[1] === this._oldSelectionEnd[1] || this._fireOnSelectionChange(e4, t4, i4)) : this._oldHasSelection && this._fireOnSelectionChange(e4, t4, i4);
          }
          _fireOnSelectionChange(e4, t4, i4) {
            this._oldSelectionStart = e4, this._oldSelectionEnd = t4, this._oldHasSelection = i4, this._onSelectionChange.fire();
          }
          _handleBufferActivate(e4) {
            this.clearSelection(), this._trimListener.dispose(), this._trimListener = e4.activeBuffer.lines.onTrim(((e5) => this._handleTrim(e5)));
          }
          _convertViewportColToCharacterIndex(e4, t4) {
            let i4 = t4;
            for (let s4 = 0; t4 >= s4; s4++) {
              const r3 = e4.loadCell(s4, this._workCell).getChars().length;
              0 === this._workCell.getWidth() ? i4-- : r3 > 1 && t4 !== s4 && (i4 += r3 - 1);
            }
            return i4;
          }
          setSelection(e4, t4, i4) {
            this._model.clearSelection(), this._removeMouseDownListeners(), this._model.selectionStart = [e4, t4], this._model.selectionStartLength = i4, this.refresh(), this._fireEventIfSelectionChanged();
          }
          rightClickSelect(e4) {
            this._isClickInSelection(e4) || (this._selectWordAtCursor(e4, false) && this.refresh(true), this._fireEventIfSelectionChanged());
          }
          _getWordAt(e4, t4, i4 = true, s4 = true) {
            if (e4[0] >= this._bufferService.cols) return;
            const r3 = this._bufferService.buffer, n3 = r3.lines.get(e4[1]);
            if (!n3) return;
            const o3 = r3.translateBufferLineToString(e4[1], false);
            let a3 = this._convertViewportColToCharacterIndex(n3, e4[0]), h3 = a3;
            const c3 = e4[0] - a3;
            let l3 = 0, d3 = 0, _3 = 0, u3 = 0;
            if (" " === o3.charAt(a3)) {
              for (; a3 > 0 && " " === o3.charAt(a3 - 1); ) a3--;
              for (; h3 < o3.length && " " === o3.charAt(h3 + 1); ) h3++;
            } else {
              let t5 = e4[0], i5 = e4[0];
              0 === n3.getWidth(t5) && (l3++, t5--), 2 === n3.getWidth(i5) && (d3++, i5++);
              const s5 = n3.getString(i5).length;
              for (s5 > 1 && (u3 += s5 - 1, h3 += s5 - 1); t5 > 0 && a3 > 0 && !this._isCharWordSeparator(n3.loadCell(t5 - 1, this._workCell)); ) {
                n3.loadCell(t5 - 1, this._workCell);
                const e5 = this._workCell.getChars().length;
                0 === this._workCell.getWidth() ? (l3++, t5--) : e5 > 1 && (_3 += e5 - 1, a3 -= e5 - 1), a3--, t5--;
              }
              for (; i5 < n3.length && h3 + 1 < o3.length && !this._isCharWordSeparator(n3.loadCell(i5 + 1, this._workCell)); ) {
                n3.loadCell(i5 + 1, this._workCell);
                const e5 = this._workCell.getChars().length;
                2 === this._workCell.getWidth() ? (d3++, i5++) : e5 > 1 && (u3 += e5 - 1, h3 += e5 - 1), h3++, i5++;
              }
            }
            h3++;
            let f3 = a3 + c3 - l3 + _3, v3 = Math.min(this._bufferService.cols, h3 - a3 + l3 + d3 - _3 - u3);
            if (t4 || "" !== o3.slice(a3, h3).trim()) {
              if (i4 && 0 === f3 && 32 !== n3.getCodePoint(0)) {
                const t5 = r3.lines.get(e4[1] - 1);
                if (t5 && n3.isWrapped && 32 !== t5.getCodePoint(this._bufferService.cols - 1)) {
                  const t6 = this._getWordAt([this._bufferService.cols - 1, e4[1] - 1], false, true, false);
                  if (t6) {
                    const e5 = this._bufferService.cols - t6.start;
                    f3 -= e5, v3 += e5;
                  }
                }
              }
              if (s4 && f3 + v3 === this._bufferService.cols && 32 !== n3.getCodePoint(this._bufferService.cols - 1)) {
                const t5 = r3.lines.get(e4[1] + 1);
                if (t5?.isWrapped && 32 !== t5.getCodePoint(0)) {
                  const t6 = this._getWordAt([0, e4[1] + 1], false, false, true);
                  t6 && (v3 += t6.length);
                }
              }
              return { start: f3, length: v3 };
            }
          }
          _selectWordAt(e4, t4) {
            const i4 = this._getWordAt(e4, t4);
            if (i4) {
              for (; i4.start < 0; ) i4.start += this._bufferService.cols, e4[1]--;
              this._model.selectionStart = [i4.start, e4[1]], this._model.selectionStartLength = i4.length;
            }
          }
          _selectToWordAt(e4) {
            const t4 = this._getWordAt(e4, true);
            if (t4) {
              let i4 = e4[1];
              for (; t4.start < 0; ) t4.start += this._bufferService.cols, i4--;
              if (!this._model.areSelectionValuesReversed()) for (; t4.start + t4.length > this._bufferService.cols; ) t4.length -= this._bufferService.cols, i4++;
              this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? t4.start : t4.start + t4.length, i4];
            }
          }
          _isCharWordSeparator(e4) {
            return 0 !== e4.getWidth() && this._optionsService.rawOptions.wordSeparator.indexOf(e4.getChars()) >= 0;
          }
          _selectLineAt(e4) {
            const t4 = this._bufferService.buffer.getWrappedRangeForLine(e4), i4 = { start: { x: 0, y: t4.first }, end: { x: this._bufferService.cols - 1, y: t4.last } };
            this._model.selectionStart = [0, t4.first], this._model.selectionEnd = void 0, this._model.selectionStartLength = (0, _2.getRangeLength)(i4, this._bufferService.cols);
          }
        };
        t3.SelectionService = g2 = s3([r2(3, f2.IBufferService), r2(4, f2.ICoreService), r2(5, h2.IMouseService), r2(6, f2.IOptionsService), r2(7, h2.IRenderService), r2(8, h2.ICoreBrowserService)], g2);
      }, 4725: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ILinkProviderService = t3.IThemeService = t3.ICharacterJoinerService = t3.ISelectionService = t3.IRenderService = t3.IMouseService = t3.ICoreBrowserService = t3.ICharSizeService = void 0;
        const s3 = i3(8343);
        t3.ICharSizeService = (0, s3.createDecorator)("CharSizeService"), t3.ICoreBrowserService = (0, s3.createDecorator)("CoreBrowserService"), t3.IMouseService = (0, s3.createDecorator)("MouseService"), t3.IRenderService = (0, s3.createDecorator)("RenderService"), t3.ISelectionService = (0, s3.createDecorator)("SelectionService"), t3.ICharacterJoinerService = (0, s3.createDecorator)("CharacterJoinerService"), t3.IThemeService = (0, s3.createDecorator)("ThemeService"), t3.ILinkProviderService = (0, s3.createDecorator)("LinkProviderService");
      }, 6731: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ThemeService = t3.DEFAULT_ANSI_COLORS = void 0;
        const n2 = i3(7239), o2 = i3(8055), a2 = i3(8460), h2 = i3(844), c2 = i3(2585), l2 = o2.css.toColor("#ffffff"), d2 = o2.css.toColor("#000000"), _2 = o2.css.toColor("#ffffff"), u2 = o2.css.toColor("#000000"), f2 = { css: "rgba(255, 255, 255, 0.3)", rgba: 4294967117 };
        t3.DEFAULT_ANSI_COLORS = Object.freeze((() => {
          const e4 = [o2.css.toColor("#2e3436"), o2.css.toColor("#cc0000"), o2.css.toColor("#4e9a06"), o2.css.toColor("#c4a000"), o2.css.toColor("#3465a4"), o2.css.toColor("#75507b"), o2.css.toColor("#06989a"), o2.css.toColor("#d3d7cf"), o2.css.toColor("#555753"), o2.css.toColor("#ef2929"), o2.css.toColor("#8ae234"), o2.css.toColor("#fce94f"), o2.css.toColor("#729fcf"), o2.css.toColor("#ad7fa8"), o2.css.toColor("#34e2e2"), o2.css.toColor("#eeeeec")], t4 = [0, 95, 135, 175, 215, 255];
          for (let i4 = 0; i4 < 216; i4++) {
            const s4 = t4[i4 / 36 % 6 | 0], r3 = t4[i4 / 6 % 6 | 0], n3 = t4[i4 % 6];
            e4.push({ css: o2.channels.toCss(s4, r3, n3), rgba: o2.channels.toRgba(s4, r3, n3) });
          }
          for (let t5 = 0; t5 < 24; t5++) {
            const i4 = 8 + 10 * t5;
            e4.push({ css: o2.channels.toCss(i4, i4, i4), rgba: o2.channels.toRgba(i4, i4, i4) });
          }
          return e4;
        })());
        let v2 = t3.ThemeService = class extends h2.Disposable {
          get colors() {
            return this._colors;
          }
          constructor(e4) {
            super(), this._optionsService = e4, this._contrastCache = new n2.ColorContrastCache(), this._halfContrastCache = new n2.ColorContrastCache(), this._onChangeColors = this.register(new a2.EventEmitter()), this.onChangeColors = this._onChangeColors.event, this._colors = { foreground: l2, background: d2, cursor: _2, cursorAccent: u2, selectionForeground: void 0, selectionBackgroundTransparent: f2, selectionBackgroundOpaque: o2.color.blend(d2, f2), selectionInactiveBackgroundTransparent: f2, selectionInactiveBackgroundOpaque: o2.color.blend(d2, f2), ansi: t3.DEFAULT_ANSI_COLORS.slice(), contrastCache: this._contrastCache, halfContrastCache: this._halfContrastCache }, this._updateRestoreColors(), this._setTheme(this._optionsService.rawOptions.theme), this.register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", (() => this._contrastCache.clear()))), this.register(this._optionsService.onSpecificOptionChange("theme", (() => this._setTheme(this._optionsService.rawOptions.theme))));
          }
          _setTheme(e4 = {}) {
            const i4 = this._colors;
            if (i4.foreground = p2(e4.foreground, l2), i4.background = p2(e4.background, d2), i4.cursor = p2(e4.cursor, _2), i4.cursorAccent = p2(e4.cursorAccent, u2), i4.selectionBackgroundTransparent = p2(e4.selectionBackground, f2), i4.selectionBackgroundOpaque = o2.color.blend(i4.background, i4.selectionBackgroundTransparent), i4.selectionInactiveBackgroundTransparent = p2(e4.selectionInactiveBackground, i4.selectionBackgroundTransparent), i4.selectionInactiveBackgroundOpaque = o2.color.blend(i4.background, i4.selectionInactiveBackgroundTransparent), i4.selectionForeground = e4.selectionForeground ? p2(e4.selectionForeground, o2.NULL_COLOR) : void 0, i4.selectionForeground === o2.NULL_COLOR && (i4.selectionForeground = void 0), o2.color.isOpaque(i4.selectionBackgroundTransparent)) {
              const e5 = 0.3;
              i4.selectionBackgroundTransparent = o2.color.opacity(i4.selectionBackgroundTransparent, e5);
            }
            if (o2.color.isOpaque(i4.selectionInactiveBackgroundTransparent)) {
              const e5 = 0.3;
              i4.selectionInactiveBackgroundTransparent = o2.color.opacity(i4.selectionInactiveBackgroundTransparent, e5);
            }
            if (i4.ansi = t3.DEFAULT_ANSI_COLORS.slice(), i4.ansi[0] = p2(e4.black, t3.DEFAULT_ANSI_COLORS[0]), i4.ansi[1] = p2(e4.red, t3.DEFAULT_ANSI_COLORS[1]), i4.ansi[2] = p2(e4.green, t3.DEFAULT_ANSI_COLORS[2]), i4.ansi[3] = p2(e4.yellow, t3.DEFAULT_ANSI_COLORS[3]), i4.ansi[4] = p2(e4.blue, t3.DEFAULT_ANSI_COLORS[4]), i4.ansi[5] = p2(e4.magenta, t3.DEFAULT_ANSI_COLORS[5]), i4.ansi[6] = p2(e4.cyan, t3.DEFAULT_ANSI_COLORS[6]), i4.ansi[7] = p2(e4.white, t3.DEFAULT_ANSI_COLORS[7]), i4.ansi[8] = p2(e4.brightBlack, t3.DEFAULT_ANSI_COLORS[8]), i4.ansi[9] = p2(e4.brightRed, t3.DEFAULT_ANSI_COLORS[9]), i4.ansi[10] = p2(e4.brightGreen, t3.DEFAULT_ANSI_COLORS[10]), i4.ansi[11] = p2(e4.brightYellow, t3.DEFAULT_ANSI_COLORS[11]), i4.ansi[12] = p2(e4.brightBlue, t3.DEFAULT_ANSI_COLORS[12]), i4.ansi[13] = p2(e4.brightMagenta, t3.DEFAULT_ANSI_COLORS[13]), i4.ansi[14] = p2(e4.brightCyan, t3.DEFAULT_ANSI_COLORS[14]), i4.ansi[15] = p2(e4.brightWhite, t3.DEFAULT_ANSI_COLORS[15]), e4.extendedAnsi) {
              const s4 = Math.min(i4.ansi.length - 16, e4.extendedAnsi.length);
              for (let r3 = 0; r3 < s4; r3++) i4.ansi[r3 + 16] = p2(e4.extendedAnsi[r3], t3.DEFAULT_ANSI_COLORS[r3 + 16]);
            }
            this._contrastCache.clear(), this._halfContrastCache.clear(), this._updateRestoreColors(), this._onChangeColors.fire(this.colors);
          }
          restoreColor(e4) {
            this._restoreColor(e4), this._onChangeColors.fire(this.colors);
          }
          _restoreColor(e4) {
            if (void 0 !== e4) switch (e4) {
              case 256:
                this._colors.foreground = this._restoreColors.foreground;
                break;
              case 257:
                this._colors.background = this._restoreColors.background;
                break;
              case 258:
                this._colors.cursor = this._restoreColors.cursor;
                break;
              default:
                this._colors.ansi[e4] = this._restoreColors.ansi[e4];
            }
            else for (let e5 = 0; e5 < this._restoreColors.ansi.length; ++e5) this._colors.ansi[e5] = this._restoreColors.ansi[e5];
          }
          modifyColors(e4) {
            e4(this._colors), this._onChangeColors.fire(this.colors);
          }
          _updateRestoreColors() {
            this._restoreColors = { foreground: this._colors.foreground, background: this._colors.background, cursor: this._colors.cursor, ansi: this._colors.ansi.slice() };
          }
        };
        function p2(e4, t4) {
          if (void 0 !== e4) try {
            return o2.css.toColor(e4);
          } catch {
          }
          return t4;
        }
        t3.ThemeService = v2 = s3([r2(0, c2.IOptionsService)], v2);
      }, 6349: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CircularList = void 0;
        const s3 = i3(8460), r2 = i3(844);
        class n2 extends r2.Disposable {
          constructor(e4) {
            super(), this._maxLength = e4, this.onDeleteEmitter = this.register(new s3.EventEmitter()), this.onDelete = this.onDeleteEmitter.event, this.onInsertEmitter = this.register(new s3.EventEmitter()), this.onInsert = this.onInsertEmitter.event, this.onTrimEmitter = this.register(new s3.EventEmitter()), this.onTrim = this.onTrimEmitter.event, this._array = new Array(this._maxLength), this._startIndex = 0, this._length = 0;
          }
          get maxLength() {
            return this._maxLength;
          }
          set maxLength(e4) {
            if (this._maxLength === e4) return;
            const t4 = new Array(e4);
            for (let i4 = 0; i4 < Math.min(e4, this.length); i4++) t4[i4] = this._array[this._getCyclicIndex(i4)];
            this._array = t4, this._maxLength = e4, this._startIndex = 0;
          }
          get length() {
            return this._length;
          }
          set length(e4) {
            if (e4 > this._length) for (let t4 = this._length; t4 < e4; t4++) this._array[t4] = void 0;
            this._length = e4;
          }
          get(e4) {
            return this._array[this._getCyclicIndex(e4)];
          }
          set(e4, t4) {
            this._array[this._getCyclicIndex(e4)] = t4;
          }
          push(e4) {
            this._array[this._getCyclicIndex(this._length)] = e4, this._length === this._maxLength ? (this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1)) : this._length++;
          }
          recycle() {
            if (this._length !== this._maxLength) throw new Error("Can only recycle when the buffer is full");
            return this._startIndex = ++this._startIndex % this._maxLength, this.onTrimEmitter.fire(1), this._array[this._getCyclicIndex(this._length - 1)];
          }
          get isFull() {
            return this._length === this._maxLength;
          }
          pop() {
            return this._array[this._getCyclicIndex(this._length-- - 1)];
          }
          splice(e4, t4, ...i4) {
            if (t4) {
              for (let i5 = e4; i5 < this._length - t4; i5++) this._array[this._getCyclicIndex(i5)] = this._array[this._getCyclicIndex(i5 + t4)];
              this._length -= t4, this.onDeleteEmitter.fire({ index: e4, amount: t4 });
            }
            for (let t5 = this._length - 1; t5 >= e4; t5--) this._array[this._getCyclicIndex(t5 + i4.length)] = this._array[this._getCyclicIndex(t5)];
            for (let t5 = 0; t5 < i4.length; t5++) this._array[this._getCyclicIndex(e4 + t5)] = i4[t5];
            if (i4.length && this.onInsertEmitter.fire({ index: e4, amount: i4.length }), this._length + i4.length > this._maxLength) {
              const e5 = this._length + i4.length - this._maxLength;
              this._startIndex += e5, this._length = this._maxLength, this.onTrimEmitter.fire(e5);
            } else this._length += i4.length;
          }
          trimStart(e4) {
            e4 > this._length && (e4 = this._length), this._startIndex += e4, this._length -= e4, this.onTrimEmitter.fire(e4);
          }
          shiftElements(e4, t4, i4) {
            if (!(t4 <= 0)) {
              if (e4 < 0 || e4 >= this._length) throw new Error("start argument out of range");
              if (e4 + i4 < 0) throw new Error("Cannot shift elements in list beyond index 0");
              if (i4 > 0) {
                for (let s5 = t4 - 1; s5 >= 0; s5--) this.set(e4 + s5 + i4, this.get(e4 + s5));
                const s4 = e4 + t4 + i4 - this._length;
                if (s4 > 0) for (this._length += s4; this._length > this._maxLength; ) this._length--, this._startIndex++, this.onTrimEmitter.fire(1);
              } else for (let s4 = 0; s4 < t4; s4++) this.set(e4 + s4 + i4, this.get(e4 + s4));
            }
          }
          _getCyclicIndex(e4) {
            return (this._startIndex + e4) % this._maxLength;
          }
        }
        t3.CircularList = n2;
      }, 1439: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.clone = void 0, t3.clone = function e4(t4, i3 = 5) {
          if ("object" != typeof t4) return t4;
          const s3 = Array.isArray(t4) ? [] : {};
          for (const r2 in t4) s3[r2] = i3 <= 1 ? t4[r2] : t4[r2] && e4(t4[r2], i3 - 1);
          return s3;
        };
      }, 8055: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.contrastRatio = t3.toPaddedHex = t3.rgba = t3.rgb = t3.css = t3.color = t3.channels = t3.NULL_COLOR = void 0;
        let i3 = 0, s3 = 0, r2 = 0, n2 = 0;
        var o2, a2, h2, c2, l2;
        function d2(e4) {
          const t4 = e4.toString(16);
          return t4.length < 2 ? "0" + t4 : t4;
        }
        function _2(e4, t4) {
          return e4 < t4 ? (t4 + 0.05) / (e4 + 0.05) : (e4 + 0.05) / (t4 + 0.05);
        }
        t3.NULL_COLOR = { css: "#00000000", rgba: 0 }, (function(e4) {
          e4.toCss = function(e5, t4, i4, s4) {
            return void 0 !== s4 ? `#${d2(e5)}${d2(t4)}${d2(i4)}${d2(s4)}` : `#${d2(e5)}${d2(t4)}${d2(i4)}`;
          }, e4.toRgba = function(e5, t4, i4, s4 = 255) {
            return (e5 << 24 | t4 << 16 | i4 << 8 | s4) >>> 0;
          }, e4.toColor = function(t4, i4, s4, r3) {
            return { css: e4.toCss(t4, i4, s4, r3), rgba: e4.toRgba(t4, i4, s4, r3) };
          };
        })(o2 || (t3.channels = o2 = {})), (function(e4) {
          function t4(e5, t5) {
            return n2 = Math.round(255 * t5), [i3, s3, r2] = l2.toChannels(e5.rgba), { css: o2.toCss(i3, s3, r2, n2), rgba: o2.toRgba(i3, s3, r2, n2) };
          }
          e4.blend = function(e5, t5) {
            if (n2 = (255 & t5.rgba) / 255, 1 === n2) return { css: t5.css, rgba: t5.rgba };
            const a3 = t5.rgba >> 24 & 255, h3 = t5.rgba >> 16 & 255, c3 = t5.rgba >> 8 & 255, l3 = e5.rgba >> 24 & 255, d3 = e5.rgba >> 16 & 255, _3 = e5.rgba >> 8 & 255;
            return i3 = l3 + Math.round((a3 - l3) * n2), s3 = d3 + Math.round((h3 - d3) * n2), r2 = _3 + Math.round((c3 - _3) * n2), { css: o2.toCss(i3, s3, r2), rgba: o2.toRgba(i3, s3, r2) };
          }, e4.isOpaque = function(e5) {
            return 255 == (255 & e5.rgba);
          }, e4.ensureContrastRatio = function(e5, t5, i4) {
            const s4 = l2.ensureContrastRatio(e5.rgba, t5.rgba, i4);
            if (s4) return o2.toColor(s4 >> 24 & 255, s4 >> 16 & 255, s4 >> 8 & 255);
          }, e4.opaque = function(e5) {
            const t5 = (255 | e5.rgba) >>> 0;
            return [i3, s3, r2] = l2.toChannels(t5), { css: o2.toCss(i3, s3, r2), rgba: t5 };
          }, e4.opacity = t4, e4.multiplyOpacity = function(e5, i4) {
            return n2 = 255 & e5.rgba, t4(e5, n2 * i4 / 255);
          }, e4.toColorRGB = function(e5) {
            return [e5.rgba >> 24 & 255, e5.rgba >> 16 & 255, e5.rgba >> 8 & 255];
          };
        })(a2 || (t3.color = a2 = {})), (function(e4) {
          let t4, a3;
          try {
            const e5 = document.createElement("canvas");
            e5.width = 1, e5.height = 1;
            const i4 = e5.getContext("2d", { willReadFrequently: true });
            i4 && (t4 = i4, t4.globalCompositeOperation = "copy", a3 = t4.createLinearGradient(0, 0, 1, 1));
          } catch {
          }
          e4.toColor = function(e5) {
            if (e5.match(/#[\da-f]{3,8}/i)) switch (e5.length) {
              case 4:
                return i3 = parseInt(e5.slice(1, 2).repeat(2), 16), s3 = parseInt(e5.slice(2, 3).repeat(2), 16), r2 = parseInt(e5.slice(3, 4).repeat(2), 16), o2.toColor(i3, s3, r2);
              case 5:
                return i3 = parseInt(e5.slice(1, 2).repeat(2), 16), s3 = parseInt(e5.slice(2, 3).repeat(2), 16), r2 = parseInt(e5.slice(3, 4).repeat(2), 16), n2 = parseInt(e5.slice(4, 5).repeat(2), 16), o2.toColor(i3, s3, r2, n2);
              case 7:
                return { css: e5, rgba: (parseInt(e5.slice(1), 16) << 8 | 255) >>> 0 };
              case 9:
                return { css: e5, rgba: parseInt(e5.slice(1), 16) >>> 0 };
            }
            const h3 = e5.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
            if (h3) return i3 = parseInt(h3[1]), s3 = parseInt(h3[2]), r2 = parseInt(h3[3]), n2 = Math.round(255 * (void 0 === h3[5] ? 1 : parseFloat(h3[5]))), o2.toColor(i3, s3, r2, n2);
            if (!t4 || !a3) throw new Error("css.toColor: Unsupported css format");
            if (t4.fillStyle = a3, t4.fillStyle = e5, "string" != typeof t4.fillStyle) throw new Error("css.toColor: Unsupported css format");
            if (t4.fillRect(0, 0, 1, 1), [i3, s3, r2, n2] = t4.getImageData(0, 0, 1, 1).data, 255 !== n2) throw new Error("css.toColor: Unsupported css format");
            return { rgba: o2.toRgba(i3, s3, r2, n2), css: e5 };
          };
        })(h2 || (t3.css = h2 = {})), (function(e4) {
          function t4(e5, t5, i4) {
            const s4 = e5 / 255, r3 = t5 / 255, n3 = i4 / 255;
            return 0.2126 * (s4 <= 0.03928 ? s4 / 12.92 : Math.pow((s4 + 0.055) / 1.055, 2.4)) + 0.7152 * (r3 <= 0.03928 ? r3 / 12.92 : Math.pow((r3 + 0.055) / 1.055, 2.4)) + 0.0722 * (n3 <= 0.03928 ? n3 / 12.92 : Math.pow((n3 + 0.055) / 1.055, 2.4));
          }
          e4.relativeLuminance = function(e5) {
            return t4(e5 >> 16 & 255, e5 >> 8 & 255, 255 & e5);
          }, e4.relativeLuminance2 = t4;
        })(c2 || (t3.rgb = c2 = {})), (function(e4) {
          function t4(e5, t5, i4) {
            const s4 = e5 >> 24 & 255, r3 = e5 >> 16 & 255, n3 = e5 >> 8 & 255;
            let o3 = t5 >> 24 & 255, a4 = t5 >> 16 & 255, h3 = t5 >> 8 & 255, l3 = _2(c2.relativeLuminance2(o3, a4, h3), c2.relativeLuminance2(s4, r3, n3));
            for (; l3 < i4 && (o3 > 0 || a4 > 0 || h3 > 0); ) o3 -= Math.max(0, Math.ceil(0.1 * o3)), a4 -= Math.max(0, Math.ceil(0.1 * a4)), h3 -= Math.max(0, Math.ceil(0.1 * h3)), l3 = _2(c2.relativeLuminance2(o3, a4, h3), c2.relativeLuminance2(s4, r3, n3));
            return (o3 << 24 | a4 << 16 | h3 << 8 | 255) >>> 0;
          }
          function a3(e5, t5, i4) {
            const s4 = e5 >> 24 & 255, r3 = e5 >> 16 & 255, n3 = e5 >> 8 & 255;
            let o3 = t5 >> 24 & 255, a4 = t5 >> 16 & 255, h3 = t5 >> 8 & 255, l3 = _2(c2.relativeLuminance2(o3, a4, h3), c2.relativeLuminance2(s4, r3, n3));
            for (; l3 < i4 && (o3 < 255 || a4 < 255 || h3 < 255); ) o3 = Math.min(255, o3 + Math.ceil(0.1 * (255 - o3))), a4 = Math.min(255, a4 + Math.ceil(0.1 * (255 - a4))), h3 = Math.min(255, h3 + Math.ceil(0.1 * (255 - h3))), l3 = _2(c2.relativeLuminance2(o3, a4, h3), c2.relativeLuminance2(s4, r3, n3));
            return (o3 << 24 | a4 << 16 | h3 << 8 | 255) >>> 0;
          }
          e4.blend = function(e5, t5) {
            if (n2 = (255 & t5) / 255, 1 === n2) return t5;
            const a4 = t5 >> 24 & 255, h3 = t5 >> 16 & 255, c3 = t5 >> 8 & 255, l3 = e5 >> 24 & 255, d3 = e5 >> 16 & 255, _3 = e5 >> 8 & 255;
            return i3 = l3 + Math.round((a4 - l3) * n2), s3 = d3 + Math.round((h3 - d3) * n2), r2 = _3 + Math.round((c3 - _3) * n2), o2.toRgba(i3, s3, r2);
          }, e4.ensureContrastRatio = function(e5, i4, s4) {
            const r3 = c2.relativeLuminance(e5 >> 8), n3 = c2.relativeLuminance(i4 >> 8);
            if (_2(r3, n3) < s4) {
              if (n3 < r3) {
                const n4 = t4(e5, i4, s4), o4 = _2(r3, c2.relativeLuminance(n4 >> 8));
                if (o4 < s4) {
                  const t5 = a3(e5, i4, s4);
                  return o4 > _2(r3, c2.relativeLuminance(t5 >> 8)) ? n4 : t5;
                }
                return n4;
              }
              const o3 = a3(e5, i4, s4), h3 = _2(r3, c2.relativeLuminance(o3 >> 8));
              if (h3 < s4) {
                const n4 = t4(e5, i4, s4);
                return h3 > _2(r3, c2.relativeLuminance(n4 >> 8)) ? o3 : n4;
              }
              return o3;
            }
          }, e4.reduceLuminance = t4, e4.increaseLuminance = a3, e4.toChannels = function(e5) {
            return [e5 >> 24 & 255, e5 >> 16 & 255, e5 >> 8 & 255, 255 & e5];
          };
        })(l2 || (t3.rgba = l2 = {})), t3.toPaddedHex = d2, t3.contrastRatio = _2;
      }, 8969: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CoreTerminal = void 0;
        const s3 = i3(844), r2 = i3(2585), n2 = i3(4348), o2 = i3(7866), a2 = i3(744), h2 = i3(7302), c2 = i3(6975), l2 = i3(8460), d2 = i3(1753), _2 = i3(1480), u2 = i3(7994), f2 = i3(9282), v2 = i3(5435), p2 = i3(5981), g2 = i3(2660);
        let m2 = false;
        class S2 extends s3.Disposable {
          get onScroll() {
            return this._onScrollApi || (this._onScrollApi = this.register(new l2.EventEmitter()), this._onScroll.event(((e4) => {
              this._onScrollApi?.fire(e4.position);
            }))), this._onScrollApi.event;
          }
          get cols() {
            return this._bufferService.cols;
          }
          get rows() {
            return this._bufferService.rows;
          }
          get buffers() {
            return this._bufferService.buffers;
          }
          get options() {
            return this.optionsService.options;
          }
          set options(e4) {
            for (const t4 in e4) this.optionsService.options[t4] = e4[t4];
          }
          constructor(e4) {
            super(), this._windowsWrappingHeuristics = this.register(new s3.MutableDisposable()), this._onBinary = this.register(new l2.EventEmitter()), this.onBinary = this._onBinary.event, this._onData = this.register(new l2.EventEmitter()), this.onData = this._onData.event, this._onLineFeed = this.register(new l2.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onResize = this.register(new l2.EventEmitter()), this.onResize = this._onResize.event, this._onWriteParsed = this.register(new l2.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event, this._onScroll = this.register(new l2.EventEmitter()), this._instantiationService = new n2.InstantiationService(), this.optionsService = this.register(new h2.OptionsService(e4)), this._instantiationService.setService(r2.IOptionsService, this.optionsService), this._bufferService = this.register(this._instantiationService.createInstance(a2.BufferService)), this._instantiationService.setService(r2.IBufferService, this._bufferService), this._logService = this.register(this._instantiationService.createInstance(o2.LogService)), this._instantiationService.setService(r2.ILogService, this._logService), this.coreService = this.register(this._instantiationService.createInstance(c2.CoreService)), this._instantiationService.setService(r2.ICoreService, this.coreService), this.coreMouseService = this.register(this._instantiationService.createInstance(d2.CoreMouseService)), this._instantiationService.setService(r2.ICoreMouseService, this.coreMouseService), this.unicodeService = this.register(this._instantiationService.createInstance(_2.UnicodeService)), this._instantiationService.setService(r2.IUnicodeService, this.unicodeService), this._charsetService = this._instantiationService.createInstance(u2.CharsetService), this._instantiationService.setService(r2.ICharsetService, this._charsetService), this._oscLinkService = this._instantiationService.createInstance(g2.OscLinkService), this._instantiationService.setService(r2.IOscLinkService, this._oscLinkService), this._inputHandler = this.register(new v2.InputHandler(this._bufferService, this._charsetService, this.coreService, this._logService, this.optionsService, this._oscLinkService, this.coreMouseService, this.unicodeService)), this.register((0, l2.forwardEvent)(this._inputHandler.onLineFeed, this._onLineFeed)), this.register(this._inputHandler), this.register((0, l2.forwardEvent)(this._bufferService.onResize, this._onResize)), this.register((0, l2.forwardEvent)(this.coreService.onData, this._onData)), this.register((0, l2.forwardEvent)(this.coreService.onBinary, this._onBinary)), this.register(this.coreService.onRequestScrollToBottom((() => this.scrollToBottom()))), this.register(this.coreService.onUserInput((() => this._writeBuffer.handleUserInput()))), this.register(this.optionsService.onMultipleOptionChange(["windowsMode", "windowsPty"], (() => this._handleWindowsPtyOptionChange()))), this.register(this._bufferService.onScroll(((e5) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            }))), this.register(this._inputHandler.onScroll(((e5) => {
              this._onScroll.fire({ position: this._bufferService.buffer.ydisp, source: 0 }), this._inputHandler.markRangeDirty(this._bufferService.buffer.scrollTop, this._bufferService.buffer.scrollBottom);
            }))), this._writeBuffer = this.register(new p2.WriteBuffer(((e5, t4) => this._inputHandler.parse(e5, t4)))), this.register((0, l2.forwardEvent)(this._writeBuffer.onWriteParsed, this._onWriteParsed));
          }
          write(e4, t4) {
            this._writeBuffer.write(e4, t4);
          }
          writeSync(e4, t4) {
            this._logService.logLevel <= r2.LogLevelEnum.WARN && !m2 && (this._logService.warn("writeSync is unreliable and will be removed soon."), m2 = true), this._writeBuffer.writeSync(e4, t4);
          }
          input(e4, t4 = true) {
            this.coreService.triggerDataEvent(e4, t4);
          }
          resize(e4, t4) {
            isNaN(e4) || isNaN(t4) || (e4 = Math.max(e4, a2.MINIMUM_COLS), t4 = Math.max(t4, a2.MINIMUM_ROWS), this._bufferService.resize(e4, t4));
          }
          scroll(e4, t4 = false) {
            this._bufferService.scroll(e4, t4);
          }
          scrollLines(e4, t4, i4) {
            this._bufferService.scrollLines(e4, t4, i4);
          }
          scrollPages(e4) {
            this.scrollLines(e4 * (this.rows - 1));
          }
          scrollToTop() {
            this.scrollLines(-this._bufferService.buffer.ydisp);
          }
          scrollToBottom() {
            this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
          }
          scrollToLine(e4) {
            const t4 = e4 - this._bufferService.buffer.ydisp;
            0 !== t4 && this.scrollLines(t4);
          }
          registerEscHandler(e4, t4) {
            return this._inputHandler.registerEscHandler(e4, t4);
          }
          registerDcsHandler(e4, t4) {
            return this._inputHandler.registerDcsHandler(e4, t4);
          }
          registerCsiHandler(e4, t4) {
            return this._inputHandler.registerCsiHandler(e4, t4);
          }
          registerOscHandler(e4, t4) {
            return this._inputHandler.registerOscHandler(e4, t4);
          }
          _setup() {
            this._handleWindowsPtyOptionChange();
          }
          reset() {
            this._inputHandler.reset(), this._bufferService.reset(), this._charsetService.reset(), this.coreService.reset(), this.coreMouseService.reset();
          }
          _handleWindowsPtyOptionChange() {
            let e4 = false;
            const t4 = this.optionsService.rawOptions.windowsPty;
            t4 && void 0 !== t4.buildNumber && void 0 !== t4.buildNumber ? e4 = !!("conpty" === t4.backend && t4.buildNumber < 21376) : this.optionsService.rawOptions.windowsMode && (e4 = true), e4 ? this._enableWindowsWrappingHeuristics() : this._windowsWrappingHeuristics.clear();
          }
          _enableWindowsWrappingHeuristics() {
            if (!this._windowsWrappingHeuristics.value) {
              const e4 = [];
              e4.push(this.onLineFeed(f2.updateWindowsModeWrappedState.bind(null, this._bufferService))), e4.push(this.registerCsiHandler({ final: "H" }, (() => ((0, f2.updateWindowsModeWrappedState)(this._bufferService), false)))), this._windowsWrappingHeuristics.value = (0, s3.toDisposable)((() => {
                for (const t4 of e4) t4.dispose();
              }));
            }
          }
        }
        t3.CoreTerminal = S2;
      }, 8460: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.runAndSubscribe = t3.forwardEvent = t3.EventEmitter = void 0, t3.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e4) => (this._listeners.push(e4), { dispose: () => {
              if (!this._disposed) {
                for (let t4 = 0; t4 < this._listeners.length; t4++) if (this._listeners[t4] === e4) return void this._listeners.splice(t4, 1);
              }
            } })), this._event;
          }
          fire(e4, t4) {
            const i3 = [];
            for (let e5 = 0; e5 < this._listeners.length; e5++) i3.push(this._listeners[e5]);
            for (let s3 = 0; s3 < i3.length; s3++) i3[s3].call(void 0, e4, t4);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t3.forwardEvent = function(e4, t4) {
          return e4(((e5) => t4.fire(e5)));
        }, t3.runAndSubscribe = function(e4, t4) {
          return t4(void 0), e4(((e5) => t4(e5)));
        };
      }, 5435: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.InputHandler = t3.WindowsOptionsReportType = void 0;
        const n2 = i3(2584), o2 = i3(7116), a2 = i3(2015), h2 = i3(844), c2 = i3(482), l2 = i3(8437), d2 = i3(8460), _2 = i3(643), u2 = i3(511), f2 = i3(3734), v2 = i3(2585), p2 = i3(1480), g2 = i3(6242), m2 = i3(6351), S2 = i3(5941), C2 = { "(": 0, ")": 1, "*": 2, "+": 3, "-": 1, ".": 2 }, b2 = 131072;
        function w2(e4, t4) {
          if (e4 > 24) return t4.setWinLines || false;
          switch (e4) {
            case 1:
              return !!t4.restoreWin;
            case 2:
              return !!t4.minimizeWin;
            case 3:
              return !!t4.setWinPosition;
            case 4:
              return !!t4.setWinSizePixels;
            case 5:
              return !!t4.raiseWin;
            case 6:
              return !!t4.lowerWin;
            case 7:
              return !!t4.refreshWin;
            case 8:
              return !!t4.setWinSizeChars;
            case 9:
              return !!t4.maximizeWin;
            case 10:
              return !!t4.fullscreenWin;
            case 11:
              return !!t4.getWinState;
            case 13:
              return !!t4.getWinPosition;
            case 14:
              return !!t4.getWinSizePixels;
            case 15:
              return !!t4.getScreenSizePixels;
            case 16:
              return !!t4.getCellSizePixels;
            case 18:
              return !!t4.getWinSizeChars;
            case 19:
              return !!t4.getScreenSizeChars;
            case 20:
              return !!t4.getIconTitle;
            case 21:
              return !!t4.getWinTitle;
            case 22:
              return !!t4.pushTitle;
            case 23:
              return !!t4.popTitle;
            case 24:
              return !!t4.setWinLines;
          }
          return false;
        }
        var y2;
        !(function(e4) {
          e4[e4.GET_WIN_SIZE_PIXELS = 0] = "GET_WIN_SIZE_PIXELS", e4[e4.GET_CELL_SIZE_PIXELS = 1] = "GET_CELL_SIZE_PIXELS";
        })(y2 || (t3.WindowsOptionsReportType = y2 = {}));
        let E2 = 0;
        class k2 extends h2.Disposable {
          getAttrData() {
            return this._curAttrData;
          }
          constructor(e4, t4, i4, s4, r3, h3, _3, f3, v3 = new a2.EscapeSequenceParser()) {
            super(), this._bufferService = e4, this._charsetService = t4, this._coreService = i4, this._logService = s4, this._optionsService = r3, this._oscLinkService = h3, this._coreMouseService = _3, this._unicodeService = f3, this._parser = v3, this._parseBuffer = new Uint32Array(4096), this._stringDecoder = new c2.StringToUtf32(), this._utf8Decoder = new c2.Utf8ToUtf32(), this._workCell = new u2.CellData(), this._windowTitle = "", this._iconName = "", this._windowTitleStack = [], this._iconNameStack = [], this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l2.DEFAULT_ATTR_DATA.clone(), this._onRequestBell = this.register(new d2.EventEmitter()), this.onRequestBell = this._onRequestBell.event, this._onRequestRefreshRows = this.register(new d2.EventEmitter()), this.onRequestRefreshRows = this._onRequestRefreshRows.event, this._onRequestReset = this.register(new d2.EventEmitter()), this.onRequestReset = this._onRequestReset.event, this._onRequestSendFocus = this.register(new d2.EventEmitter()), this.onRequestSendFocus = this._onRequestSendFocus.event, this._onRequestSyncScrollBar = this.register(new d2.EventEmitter()), this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event, this._onRequestWindowsOptionsReport = this.register(new d2.EventEmitter()), this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event, this._onA11yChar = this.register(new d2.EventEmitter()), this.onA11yChar = this._onA11yChar.event, this._onA11yTab = this.register(new d2.EventEmitter()), this.onA11yTab = this._onA11yTab.event, this._onCursorMove = this.register(new d2.EventEmitter()), this.onCursorMove = this._onCursorMove.event, this._onLineFeed = this.register(new d2.EventEmitter()), this.onLineFeed = this._onLineFeed.event, this._onScroll = this.register(new d2.EventEmitter()), this.onScroll = this._onScroll.event, this._onTitleChange = this.register(new d2.EventEmitter()), this.onTitleChange = this._onTitleChange.event, this._onColor = this.register(new d2.EventEmitter()), this.onColor = this._onColor.event, this._parseStack = { paused: false, cursorStartX: 0, cursorStartY: 0, decodedLength: 0, position: 0 }, this._specialColors = [256, 257, 258], this.register(this._parser), this._dirtyRowTracker = new L2(this._bufferService), this._activeBuffer = this._bufferService.buffer, this.register(this._bufferService.buffers.onBufferActivate(((e5) => this._activeBuffer = e5.activeBuffer))), this._parser.setCsiHandlerFallback(((e5, t5) => {
              this._logService.debug("Unknown CSI code: ", { identifier: this._parser.identToString(e5), params: t5.toArray() });
            })), this._parser.setEscHandlerFallback(((e5) => {
              this._logService.debug("Unknown ESC code: ", { identifier: this._parser.identToString(e5) });
            })), this._parser.setExecuteHandlerFallback(((e5) => {
              this._logService.debug("Unknown EXECUTE code: ", { code: e5 });
            })), this._parser.setOscHandlerFallback(((e5, t5, i5) => {
              this._logService.debug("Unknown OSC code: ", { identifier: e5, action: t5, data: i5 });
            })), this._parser.setDcsHandlerFallback(((e5, t5, i5) => {
              "HOOK" === t5 && (i5 = i5.toArray()), this._logService.debug("Unknown DCS code: ", { identifier: this._parser.identToString(e5), action: t5, payload: i5 });
            })), this._parser.setPrintHandler(((e5, t5, i5) => this.print(e5, t5, i5))), this._parser.registerCsiHandler({ final: "@" }, ((e5) => this.insertChars(e5))), this._parser.registerCsiHandler({ intermediates: " ", final: "@" }, ((e5) => this.scrollLeft(e5))), this._parser.registerCsiHandler({ final: "A" }, ((e5) => this.cursorUp(e5))), this._parser.registerCsiHandler({ intermediates: " ", final: "A" }, ((e5) => this.scrollRight(e5))), this._parser.registerCsiHandler({ final: "B" }, ((e5) => this.cursorDown(e5))), this._parser.registerCsiHandler({ final: "C" }, ((e5) => this.cursorForward(e5))), this._parser.registerCsiHandler({ final: "D" }, ((e5) => this.cursorBackward(e5))), this._parser.registerCsiHandler({ final: "E" }, ((e5) => this.cursorNextLine(e5))), this._parser.registerCsiHandler({ final: "F" }, ((e5) => this.cursorPrecedingLine(e5))), this._parser.registerCsiHandler({ final: "G" }, ((e5) => this.cursorCharAbsolute(e5))), this._parser.registerCsiHandler({ final: "H" }, ((e5) => this.cursorPosition(e5))), this._parser.registerCsiHandler({ final: "I" }, ((e5) => this.cursorForwardTab(e5))), this._parser.registerCsiHandler({ final: "J" }, ((e5) => this.eraseInDisplay(e5, false))), this._parser.registerCsiHandler({ prefix: "?", final: "J" }, ((e5) => this.eraseInDisplay(e5, true))), this._parser.registerCsiHandler({ final: "K" }, ((e5) => this.eraseInLine(e5, false))), this._parser.registerCsiHandler({ prefix: "?", final: "K" }, ((e5) => this.eraseInLine(e5, true))), this._parser.registerCsiHandler({ final: "L" }, ((e5) => this.insertLines(e5))), this._parser.registerCsiHandler({ final: "M" }, ((e5) => this.deleteLines(e5))), this._parser.registerCsiHandler({ final: "P" }, ((e5) => this.deleteChars(e5))), this._parser.registerCsiHandler({ final: "S" }, ((e5) => this.scrollUp(e5))), this._parser.registerCsiHandler({ final: "T" }, ((e5) => this.scrollDown(e5))), this._parser.registerCsiHandler({ final: "X" }, ((e5) => this.eraseChars(e5))), this._parser.registerCsiHandler({ final: "Z" }, ((e5) => this.cursorBackwardTab(e5))), this._parser.registerCsiHandler({ final: "`" }, ((e5) => this.charPosAbsolute(e5))), this._parser.registerCsiHandler({ final: "a" }, ((e5) => this.hPositionRelative(e5))), this._parser.registerCsiHandler({ final: "b" }, ((e5) => this.repeatPrecedingCharacter(e5))), this._parser.registerCsiHandler({ final: "c" }, ((e5) => this.sendDeviceAttributesPrimary(e5))), this._parser.registerCsiHandler({ prefix: ">", final: "c" }, ((e5) => this.sendDeviceAttributesSecondary(e5))), this._parser.registerCsiHandler({ final: "d" }, ((e5) => this.linePosAbsolute(e5))), this._parser.registerCsiHandler({ final: "e" }, ((e5) => this.vPositionRelative(e5))), this._parser.registerCsiHandler({ final: "f" }, ((e5) => this.hVPosition(e5))), this._parser.registerCsiHandler({ final: "g" }, ((e5) => this.tabClear(e5))), this._parser.registerCsiHandler({ final: "h" }, ((e5) => this.setMode(e5))), this._parser.registerCsiHandler({ prefix: "?", final: "h" }, ((e5) => this.setModePrivate(e5))), this._parser.registerCsiHandler({ final: "l" }, ((e5) => this.resetMode(e5))), this._parser.registerCsiHandler({ prefix: "?", final: "l" }, ((e5) => this.resetModePrivate(e5))), this._parser.registerCsiHandler({ final: "m" }, ((e5) => this.charAttributes(e5))), this._parser.registerCsiHandler({ final: "n" }, ((e5) => this.deviceStatus(e5))), this._parser.registerCsiHandler({ prefix: "?", final: "n" }, ((e5) => this.deviceStatusPrivate(e5))), this._parser.registerCsiHandler({ intermediates: "!", final: "p" }, ((e5) => this.softReset(e5))), this._parser.registerCsiHandler({ intermediates: " ", final: "q" }, ((e5) => this.setCursorStyle(e5))), this._parser.registerCsiHandler({ final: "r" }, ((e5) => this.setScrollRegion(e5))), this._parser.registerCsiHandler({ final: "s" }, ((e5) => this.saveCursor(e5))), this._parser.registerCsiHandler({ final: "t" }, ((e5) => this.windowOptions(e5))), this._parser.registerCsiHandler({ final: "u" }, ((e5) => this.restoreCursor(e5))), this._parser.registerCsiHandler({ intermediates: "'", final: "}" }, ((e5) => this.insertColumns(e5))), this._parser.registerCsiHandler({ intermediates: "'", final: "~" }, ((e5) => this.deleteColumns(e5))), this._parser.registerCsiHandler({ intermediates: '"', final: "q" }, ((e5) => this.selectProtected(e5))), this._parser.registerCsiHandler({ intermediates: "$", final: "p" }, ((e5) => this.requestMode(e5, true))), this._parser.registerCsiHandler({ prefix: "?", intermediates: "$", final: "p" }, ((e5) => this.requestMode(e5, false))), this._parser.setExecuteHandler(n2.C0.BEL, (() => this.bell())), this._parser.setExecuteHandler(n2.C0.LF, (() => this.lineFeed())), this._parser.setExecuteHandler(n2.C0.VT, (() => this.lineFeed())), this._parser.setExecuteHandler(n2.C0.FF, (() => this.lineFeed())), this._parser.setExecuteHandler(n2.C0.CR, (() => this.carriageReturn())), this._parser.setExecuteHandler(n2.C0.BS, (() => this.backspace())), this._parser.setExecuteHandler(n2.C0.HT, (() => this.tab())), this._parser.setExecuteHandler(n2.C0.SO, (() => this.shiftOut())), this._parser.setExecuteHandler(n2.C0.SI, (() => this.shiftIn())), this._parser.setExecuteHandler(n2.C1.IND, (() => this.index())), this._parser.setExecuteHandler(n2.C1.NEL, (() => this.nextLine())), this._parser.setExecuteHandler(n2.C1.HTS, (() => this.tabSet())), this._parser.registerOscHandler(0, new g2.OscHandler(((e5) => (this.setTitle(e5), this.setIconName(e5), true)))), this._parser.registerOscHandler(1, new g2.OscHandler(((e5) => this.setIconName(e5)))), this._parser.registerOscHandler(2, new g2.OscHandler(((e5) => this.setTitle(e5)))), this._parser.registerOscHandler(4, new g2.OscHandler(((e5) => this.setOrReportIndexedColor(e5)))), this._parser.registerOscHandler(8, new g2.OscHandler(((e5) => this.setHyperlink(e5)))), this._parser.registerOscHandler(10, new g2.OscHandler(((e5) => this.setOrReportFgColor(e5)))), this._parser.registerOscHandler(11, new g2.OscHandler(((e5) => this.setOrReportBgColor(e5)))), this._parser.registerOscHandler(12, new g2.OscHandler(((e5) => this.setOrReportCursorColor(e5)))), this._parser.registerOscHandler(104, new g2.OscHandler(((e5) => this.restoreIndexedColor(e5)))), this._parser.registerOscHandler(110, new g2.OscHandler(((e5) => this.restoreFgColor(e5)))), this._parser.registerOscHandler(111, new g2.OscHandler(((e5) => this.restoreBgColor(e5)))), this._parser.registerOscHandler(112, new g2.OscHandler(((e5) => this.restoreCursorColor(e5)))), this._parser.registerEscHandler({ final: "7" }, (() => this.saveCursor())), this._parser.registerEscHandler({ final: "8" }, (() => this.restoreCursor())), this._parser.registerEscHandler({ final: "D" }, (() => this.index())), this._parser.registerEscHandler({ final: "E" }, (() => this.nextLine())), this._parser.registerEscHandler({ final: "H" }, (() => this.tabSet())), this._parser.registerEscHandler({ final: "M" }, (() => this.reverseIndex())), this._parser.registerEscHandler({ final: "=" }, (() => this.keypadApplicationMode())), this._parser.registerEscHandler({ final: ">" }, (() => this.keypadNumericMode())), this._parser.registerEscHandler({ final: "c" }, (() => this.fullReset())), this._parser.registerEscHandler({ final: "n" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "o" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "|" }, (() => this.setgLevel(3))), this._parser.registerEscHandler({ final: "}" }, (() => this.setgLevel(2))), this._parser.registerEscHandler({ final: "~" }, (() => this.setgLevel(1))), this._parser.registerEscHandler({ intermediates: "%", final: "@" }, (() => this.selectDefaultCharset())), this._parser.registerEscHandler({ intermediates: "%", final: "G" }, (() => this.selectDefaultCharset()));
            for (const e5 in o2.CHARSETS) this._parser.registerEscHandler({ intermediates: "(", final: e5 }, (() => this.selectCharset("(" + e5))), this._parser.registerEscHandler({ intermediates: ")", final: e5 }, (() => this.selectCharset(")" + e5))), this._parser.registerEscHandler({ intermediates: "*", final: e5 }, (() => this.selectCharset("*" + e5))), this._parser.registerEscHandler({ intermediates: "+", final: e5 }, (() => this.selectCharset("+" + e5))), this._parser.registerEscHandler({ intermediates: "-", final: e5 }, (() => this.selectCharset("-" + e5))), this._parser.registerEscHandler({ intermediates: ".", final: e5 }, (() => this.selectCharset("." + e5))), this._parser.registerEscHandler({ intermediates: "/", final: e5 }, (() => this.selectCharset("/" + e5)));
            this._parser.registerEscHandler({ intermediates: "#", final: "8" }, (() => this.screenAlignmentPattern())), this._parser.setErrorHandler(((e5) => (this._logService.error("Parsing error: ", e5), e5))), this._parser.registerDcsHandler({ intermediates: "$", final: "q" }, new m2.DcsHandler(((e5, t5) => this.requestStatusString(e5, t5))));
          }
          _preserveStack(e4, t4, i4, s4) {
            this._parseStack.paused = true, this._parseStack.cursorStartX = e4, this._parseStack.cursorStartY = t4, this._parseStack.decodedLength = i4, this._parseStack.position = s4;
          }
          _logSlowResolvingAsync(e4) {
            this._logService.logLevel <= v2.LogLevelEnum.WARN && Promise.race([e4, new Promise(((e5, t4) => setTimeout((() => t4("#SLOW_TIMEOUT")), 5e3)))]).catch(((e5) => {
              if ("#SLOW_TIMEOUT" !== e5) throw e5;
              console.warn("async parser handler taking longer than 5000 ms");
            }));
          }
          _getCurrentLinkId() {
            return this._curAttrData.extended.urlId;
          }
          parse(e4, t4) {
            let i4, s4 = this._activeBuffer.x, r3 = this._activeBuffer.y, n3 = 0;
            const o3 = this._parseStack.paused;
            if (o3) {
              if (i4 = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, t4)) return this._logSlowResolvingAsync(i4), i4;
              s4 = this._parseStack.cursorStartX, r3 = this._parseStack.cursorStartY, this._parseStack.paused = false, e4.length > b2 && (n3 = this._parseStack.position + b2);
            }
            if (this._logService.logLevel <= v2.LogLevelEnum.DEBUG && this._logService.debug("parsing data" + ("string" == typeof e4 ? ` "${e4}"` : ` "${Array.prototype.map.call(e4, ((e5) => String.fromCharCode(e5))).join("")}"`), "string" == typeof e4 ? e4.split("").map(((e5) => e5.charCodeAt(0))) : e4), this._parseBuffer.length < e4.length && this._parseBuffer.length < b2 && (this._parseBuffer = new Uint32Array(Math.min(e4.length, b2))), o3 || this._dirtyRowTracker.clearRange(), e4.length > b2) for (let t5 = n3; t5 < e4.length; t5 += b2) {
              const n4 = t5 + b2 < e4.length ? t5 + b2 : e4.length, o4 = "string" == typeof e4 ? this._stringDecoder.decode(e4.substring(t5, n4), this._parseBuffer) : this._utf8Decoder.decode(e4.subarray(t5, n4), this._parseBuffer);
              if (i4 = this._parser.parse(this._parseBuffer, o4)) return this._preserveStack(s4, r3, o4, t5), this._logSlowResolvingAsync(i4), i4;
            }
            else if (!o3) {
              const t5 = "string" == typeof e4 ? this._stringDecoder.decode(e4, this._parseBuffer) : this._utf8Decoder.decode(e4, this._parseBuffer);
              if (i4 = this._parser.parse(this._parseBuffer, t5)) return this._preserveStack(s4, r3, t5, 0), this._logSlowResolvingAsync(i4), i4;
            }
            this._activeBuffer.x === s4 && this._activeBuffer.y === r3 || this._onCursorMove.fire();
            const a3 = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp), h3 = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
            h3 < this._bufferService.rows && this._onRequestRefreshRows.fire(Math.min(h3, this._bufferService.rows - 1), Math.min(a3, this._bufferService.rows - 1));
          }
          print(e4, t4, i4) {
            let s4, r3;
            const n3 = this._charsetService.charset, o3 = this._optionsService.rawOptions.screenReaderMode, a3 = this._bufferService.cols, h3 = this._coreService.decPrivateModes.wraparound, d3 = this._coreService.modes.insertMode, u3 = this._curAttrData;
            let f3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._activeBuffer.x && i4 - t4 > 0 && 2 === f3.getWidth(this._activeBuffer.x - 1) && f3.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, u3);
            let v3 = this._parser.precedingJoinState;
            for (let g3 = t4; g3 < i4; ++g3) {
              if (s4 = e4[g3], s4 < 127 && n3) {
                const e5 = n3[String.fromCharCode(s4)];
                e5 && (s4 = e5.charCodeAt(0));
              }
              const t5 = this._unicodeService.charProperties(s4, v3);
              r3 = p2.UnicodeService.extractWidth(t5);
              const i5 = p2.UnicodeService.extractShouldJoin(t5), m3 = i5 ? p2.UnicodeService.extractWidth(v3) : 0;
              if (v3 = t5, o3 && this._onA11yChar.fire((0, c2.stringFromCodePoint)(s4)), this._getCurrentLinkId() && this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y), this._activeBuffer.x + r3 - m3 > a3) {
                if (h3) {
                  const e5 = f3;
                  let t6 = this._activeBuffer.x - m3;
                  for (this._activeBuffer.x = m3, this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData(), true)) : (this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true), f3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y), m3 > 0 && f3 instanceof l2.BufferLine && f3.copyCellsFrom(e5, t6, 0, m3, false); t6 < a3; ) e5.setCellFromCodepoint(t6++, 0, 1, u3);
                } else if (this._activeBuffer.x = a3 - 1, 2 === r3) continue;
              }
              if (i5 && this._activeBuffer.x) {
                const e5 = f3.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
                f3.addCodepointToCell(this._activeBuffer.x - e5, s4, r3);
                for (let e6 = r3 - m3; --e6 >= 0; ) f3.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, u3);
              } else if (d3 && (f3.insertCells(this._activeBuffer.x, r3 - m3, this._activeBuffer.getNullCell(u3)), 2 === f3.getWidth(a3 - 1) && f3.setCellFromCodepoint(a3 - 1, _2.NULL_CELL_CODE, _2.NULL_CELL_WIDTH, u3)), f3.setCellFromCodepoint(this._activeBuffer.x++, s4, r3, u3), r3 > 0) for (; --r3; ) f3.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, u3);
            }
            this._parser.precedingJoinState = v3, this._activeBuffer.x < a3 && i4 - t4 > 0 && 0 === f3.getWidth(this._activeBuffer.x) && !f3.hasContent(this._activeBuffer.x) && f3.setCellFromCodepoint(this._activeBuffer.x, 0, 1, u3), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          registerCsiHandler(e4, t4) {
            return "t" !== e4.final || e4.prefix || e4.intermediates ? this._parser.registerCsiHandler(e4, t4) : this._parser.registerCsiHandler(e4, ((e5) => !w2(e5.params[0], this._optionsService.rawOptions.windowOptions) || t4(e5)));
          }
          registerDcsHandler(e4, t4) {
            return this._parser.registerDcsHandler(e4, new m2.DcsHandler(t4));
          }
          registerEscHandler(e4, t4) {
            return this._parser.registerEscHandler(e4, t4);
          }
          registerOscHandler(e4, t4) {
            return this._parser.registerOscHandler(e4, new g2.OscHandler(t4));
          }
          bell() {
            return this._onRequestBell.fire(), true;
          }
          lineFeed() {
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._optionsService.rawOptions.convertEol && (this._activeBuffer.x = 0), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows ? this._activeBuffer.y = this._bufferService.rows - 1 : this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.x >= this._bufferService.cols && this._activeBuffer.x--, this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._onLineFeed.fire(), true;
          }
          carriageReturn() {
            return this._activeBuffer.x = 0, true;
          }
          backspace() {
            if (!this._coreService.decPrivateModes.reverseWraparound) return this._restrictCursor(), this._activeBuffer.x > 0 && this._activeBuffer.x--, true;
            if (this._restrictCursor(this._bufferService.cols), this._activeBuffer.x > 0) this._activeBuffer.x--;
            else if (0 === this._activeBuffer.x && this._activeBuffer.y > this._activeBuffer.scrollTop && this._activeBuffer.y <= this._activeBuffer.scrollBottom && this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)?.isWrapped) {
              this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false, this._activeBuffer.y--, this._activeBuffer.x = this._bufferService.cols - 1;
              const e4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
              e4.hasWidth(this._activeBuffer.x) && !e4.hasContent(this._activeBuffer.x) && this._activeBuffer.x--;
            }
            return this._restrictCursor(), true;
          }
          tab() {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            const e4 = this._activeBuffer.x;
            return this._activeBuffer.x = this._activeBuffer.nextStop(), this._optionsService.rawOptions.screenReaderMode && this._onA11yTab.fire(this._activeBuffer.x - e4), true;
          }
          shiftOut() {
            return this._charsetService.setgLevel(1), true;
          }
          shiftIn() {
            return this._charsetService.setgLevel(0), true;
          }
          _restrictCursor(e4 = this._bufferService.cols - 1) {
            this._activeBuffer.x = Math.min(e4, Math.max(0, this._activeBuffer.x)), this._activeBuffer.y = this._coreService.decPrivateModes.origin ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y)) : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y)), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _setCursor(e4, t4) {
            this._dirtyRowTracker.markDirty(this._activeBuffer.y), this._coreService.decPrivateModes.origin ? (this._activeBuffer.x = e4, this._activeBuffer.y = this._activeBuffer.scrollTop + t4) : (this._activeBuffer.x = e4, this._activeBuffer.y = t4), this._restrictCursor(), this._dirtyRowTracker.markDirty(this._activeBuffer.y);
          }
          _moveCursor(e4, t4) {
            this._restrictCursor(), this._setCursor(this._activeBuffer.x + e4, this._activeBuffer.y + t4);
          }
          cursorUp(e4) {
            const t4 = this._activeBuffer.y - this._activeBuffer.scrollTop;
            return t4 >= 0 ? this._moveCursor(0, -Math.min(t4, e4.params[0] || 1)) : this._moveCursor(0, -(e4.params[0] || 1)), true;
          }
          cursorDown(e4) {
            const t4 = this._activeBuffer.scrollBottom - this._activeBuffer.y;
            return t4 >= 0 ? this._moveCursor(0, Math.min(t4, e4.params[0] || 1)) : this._moveCursor(0, e4.params[0] || 1), true;
          }
          cursorForward(e4) {
            return this._moveCursor(e4.params[0] || 1, 0), true;
          }
          cursorBackward(e4) {
            return this._moveCursor(-(e4.params[0] || 1), 0), true;
          }
          cursorNextLine(e4) {
            return this.cursorDown(e4), this._activeBuffer.x = 0, true;
          }
          cursorPrecedingLine(e4) {
            return this.cursorUp(e4), this._activeBuffer.x = 0, true;
          }
          cursorCharAbsolute(e4) {
            return this._setCursor((e4.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          cursorPosition(e4) {
            return this._setCursor(e4.length >= 2 ? (e4.params[1] || 1) - 1 : 0, (e4.params[0] || 1) - 1), true;
          }
          charPosAbsolute(e4) {
            return this._setCursor((e4.params[0] || 1) - 1, this._activeBuffer.y), true;
          }
          hPositionRelative(e4) {
            return this._moveCursor(e4.params[0] || 1, 0), true;
          }
          linePosAbsolute(e4) {
            return this._setCursor(this._activeBuffer.x, (e4.params[0] || 1) - 1), true;
          }
          vPositionRelative(e4) {
            return this._moveCursor(0, e4.params[0] || 1), true;
          }
          hVPosition(e4) {
            return this.cursorPosition(e4), true;
          }
          tabClear(e4) {
            const t4 = e4.params[0];
            return 0 === t4 ? delete this._activeBuffer.tabs[this._activeBuffer.x] : 3 === t4 && (this._activeBuffer.tabs = {}), true;
          }
          cursorForwardTab(e4) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t4 = e4.params[0] || 1;
            for (; t4--; ) this._activeBuffer.x = this._activeBuffer.nextStop();
            return true;
          }
          cursorBackwardTab(e4) {
            if (this._activeBuffer.x >= this._bufferService.cols) return true;
            let t4 = e4.params[0] || 1;
            for (; t4--; ) this._activeBuffer.x = this._activeBuffer.prevStop();
            return true;
          }
          selectProtected(e4) {
            const t4 = e4.params[0];
            return 1 === t4 && (this._curAttrData.bg |= 536870912), 2 !== t4 && 0 !== t4 || (this._curAttrData.bg &= -536870913), true;
          }
          _eraseInBufferLine(e4, t4, i4, s4 = false, r3 = false) {
            const n3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
            n3.replaceCells(t4, i4, this._activeBuffer.getNullCell(this._eraseAttrData()), r3), s4 && (n3.isWrapped = false);
          }
          _resetBufferLine(e4, t4 = false) {
            const i4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e4);
            i4 && (i4.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), t4), this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + e4), i4.isWrapped = false);
          }
          eraseInDisplay(e4, t4 = false) {
            let i4;
            switch (this._restrictCursor(this._bufferService.cols), e4.params[0]) {
              case 0:
                for (i4 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i4), this._eraseInBufferLine(i4++, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t4); i4 < this._bufferService.rows; i4++) this._resetBufferLine(i4, t4);
                this._dirtyRowTracker.markDirty(i4);
                break;
              case 1:
                for (i4 = this._activeBuffer.y, this._dirtyRowTracker.markDirty(i4), this._eraseInBufferLine(i4, 0, this._activeBuffer.x + 1, true, t4), this._activeBuffer.x + 1 >= this._bufferService.cols && (this._activeBuffer.lines.get(i4 + 1).isWrapped = false); i4--; ) this._resetBufferLine(i4, t4);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 2:
                for (i4 = this._bufferService.rows, this._dirtyRowTracker.markDirty(i4 - 1); i4--; ) this._resetBufferLine(i4, t4);
                this._dirtyRowTracker.markDirty(0);
                break;
              case 3:
                const e5 = this._activeBuffer.lines.length - this._bufferService.rows;
                e5 > 0 && (this._activeBuffer.lines.trimStart(e5), this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - e5, 0), this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - e5, 0), this._onScroll.fire(0));
            }
            return true;
          }
          eraseInLine(e4, t4 = false) {
            switch (this._restrictCursor(this._bufferService.cols), e4.params[0]) {
              case 0:
                this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, 0 === this._activeBuffer.x, t4);
                break;
              case 1:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, t4);
                break;
              case 2:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, t4);
            }
            return this._dirtyRowTracker.markDirty(this._activeBuffer.y), true;
          }
          insertLines(e4) {
            this._restrictCursor();
            let t4 = e4.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i4 = this._activeBuffer.ybase + this._activeBuffer.y, s4 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, r3 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s4 + 1;
            for (; t4--; ) this._activeBuffer.lines.splice(r3 - 1, 1), this._activeBuffer.lines.splice(i4, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          deleteLines(e4) {
            this._restrictCursor();
            let t4 = e4.params[0] || 1;
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const i4 = this._activeBuffer.ybase + this._activeBuffer.y;
            let s4;
            for (s4 = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom, s4 = this._bufferService.rows - 1 + this._activeBuffer.ybase - s4; t4--; ) this._activeBuffer.lines.splice(i4, 1), this._activeBuffer.lines.splice(s4, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom), this._activeBuffer.x = 0, true;
          }
          insertChars(e4) {
            this._restrictCursor();
            const t4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t4 && (t4.insertCells(this._activeBuffer.x, e4.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          deleteChars(e4) {
            this._restrictCursor();
            const t4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t4 && (t4.deleteCells(this._activeBuffer.x, e4.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          scrollUp(e4) {
            let t4 = e4.params[0] || 1;
            for (; t4--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollDown(e4) {
            let t4 = e4.params[0] || 1;
            for (; t4--; ) this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1), this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(l2.DEFAULT_ATTR_DATA));
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollLeft(e4) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t4 = e4.params[0] || 1;
            for (let e5 = this._activeBuffer.scrollTop; e5 <= this._activeBuffer.scrollBottom; ++e5) {
              const i4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e5);
              i4.deleteCells(0, t4, this._activeBuffer.getNullCell(this._eraseAttrData())), i4.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          scrollRight(e4) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t4 = e4.params[0] || 1;
            for (let e5 = this._activeBuffer.scrollTop; e5 <= this._activeBuffer.scrollBottom; ++e5) {
              const i4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e5);
              i4.insertCells(0, t4, this._activeBuffer.getNullCell(this._eraseAttrData())), i4.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          insertColumns(e4) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t4 = e4.params[0] || 1;
            for (let e5 = this._activeBuffer.scrollTop; e5 <= this._activeBuffer.scrollBottom; ++e5) {
              const i4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e5);
              i4.insertCells(this._activeBuffer.x, t4, this._activeBuffer.getNullCell(this._eraseAttrData())), i4.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          deleteColumns(e4) {
            if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) return true;
            const t4 = e4.params[0] || 1;
            for (let e5 = this._activeBuffer.scrollTop; e5 <= this._activeBuffer.scrollBottom; ++e5) {
              const i4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + e5);
              i4.deleteCells(this._activeBuffer.x, t4, this._activeBuffer.getNullCell(this._eraseAttrData())), i4.isWrapped = false;
            }
            return this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom), true;
          }
          eraseChars(e4) {
            this._restrictCursor();
            const t4 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
            return t4 && (t4.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (e4.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData())), this._dirtyRowTracker.markDirty(this._activeBuffer.y)), true;
          }
          repeatPrecedingCharacter(e4) {
            const t4 = this._parser.precedingJoinState;
            if (!t4) return true;
            const i4 = e4.params[0] || 1, s4 = p2.UnicodeService.extractWidth(t4), r3 = this._activeBuffer.x - s4, n3 = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).getString(r3), o3 = new Uint32Array(n3.length * i4);
            let a3 = 0;
            for (let e5 = 0; e5 < n3.length; ) {
              const t5 = n3.codePointAt(e5) || 0;
              o3[a3++] = t5, e5 += t5 > 65535 ? 2 : 1;
            }
            let h3 = a3;
            for (let e5 = 1; e5 < i4; ++e5) o3.copyWithin(h3, 0, a3), h3 += a3;
            return this.print(o3, 0, h3), true;
          }
          sendDeviceAttributesPrimary(e4) {
            return e4.params[0] > 0 || (this._is("xterm") || this._is("rxvt-unicode") || this._is("screen") ? this._coreService.triggerDataEvent(n2.C0.ESC + "[?1;2c") : this._is("linux") && this._coreService.triggerDataEvent(n2.C0.ESC + "[?6c")), true;
          }
          sendDeviceAttributesSecondary(e4) {
            return e4.params[0] > 0 || (this._is("xterm") ? this._coreService.triggerDataEvent(n2.C0.ESC + "[>0;276;0c") : this._is("rxvt-unicode") ? this._coreService.triggerDataEvent(n2.C0.ESC + "[>85;95;0c") : this._is("linux") ? this._coreService.triggerDataEvent(e4.params[0] + "c") : this._is("screen") && this._coreService.triggerDataEvent(n2.C0.ESC + "[>83;40003;0c")), true;
          }
          _is(e4) {
            return 0 === (this._optionsService.rawOptions.termName + "").indexOf(e4);
          }
          setMode(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) switch (e4.params[t4]) {
              case 4:
                this._coreService.modes.insertMode = true;
                break;
              case 20:
                this._optionsService.options.convertEol = true;
            }
            return true;
          }
          setModePrivate(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) switch (e4.params[t4]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = true;
                break;
              case 2:
                this._charsetService.setgCharset(0, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(1, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(2, o2.DEFAULT_CHARSET), this._charsetService.setgCharset(3, o2.DEFAULT_CHARSET);
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(132, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = true, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = true;
                break;
              case 12:
                this._optionsService.options.cursorBlink = true;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = true;
                break;
              case 66:
                this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
                this._coreMouseService.activeProtocol = "X10";
                break;
              case 1e3:
                this._coreMouseService.activeProtocol = "VT200";
                break;
              case 1002:
                this._coreMouseService.activeProtocol = "DRAG";
                break;
              case 1003:
                this._coreMouseService.activeProtocol = "ANY";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = true, this._onRequestSendFocus.fire();
                break;
              case 1005:
                this._logService.debug("DECSET 1005 not supported (see #2507)");
                break;
              case 1006:
                this._coreMouseService.activeEncoding = "SGR";
                break;
              case 1015:
                this._logService.debug("DECSET 1015 not supported (see #2507)");
                break;
              case 1016:
                this._coreMouseService.activeEncoding = "SGR_PIXELS";
                break;
              case 25:
                this._coreService.isCursorHidden = false;
                break;
              case 1048:
                this.saveCursor();
                break;
              case 1049:
                this.saveCursor();
              case 47:
              case 1047:
                this._bufferService.buffers.activateAltBuffer(this._eraseAttrData()), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = true;
            }
            return true;
          }
          resetMode(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) switch (e4.params[t4]) {
              case 4:
                this._coreService.modes.insertMode = false;
                break;
              case 20:
                this._optionsService.options.convertEol = false;
            }
            return true;
          }
          resetModePrivate(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) switch (e4.params[t4]) {
              case 1:
                this._coreService.decPrivateModes.applicationCursorKeys = false;
                break;
              case 3:
                this._optionsService.rawOptions.windowOptions.setWinLines && (this._bufferService.resize(80, this._bufferService.rows), this._onRequestReset.fire());
                break;
              case 6:
                this._coreService.decPrivateModes.origin = false, this._setCursor(0, 0);
                break;
              case 7:
                this._coreService.decPrivateModes.wraparound = false;
                break;
              case 12:
                this._optionsService.options.cursorBlink = false;
                break;
              case 45:
                this._coreService.decPrivateModes.reverseWraparound = false;
                break;
              case 66:
                this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire();
                break;
              case 9:
              case 1e3:
              case 1002:
              case 1003:
                this._coreMouseService.activeProtocol = "NONE";
                break;
              case 1004:
                this._coreService.decPrivateModes.sendFocus = false;
                break;
              case 1005:
                this._logService.debug("DECRST 1005 not supported (see #2507)");
                break;
              case 1006:
              case 1016:
                this._coreMouseService.activeEncoding = "DEFAULT";
                break;
              case 1015:
                this._logService.debug("DECRST 1015 not supported (see #2507)");
                break;
              case 25:
                this._coreService.isCursorHidden = true;
                break;
              case 1048:
                this.restoreCursor();
                break;
              case 1049:
              case 47:
              case 1047:
                this._bufferService.buffers.activateNormalBuffer(), 1049 === e4.params[t4] && this.restoreCursor(), this._coreService.isCursorInitialized = true, this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1), this._onRequestSyncScrollBar.fire();
                break;
              case 2004:
                this._coreService.decPrivateModes.bracketedPasteMode = false;
            }
            return true;
          }
          requestMode(e4, t4) {
            const i4 = this._coreService.decPrivateModes, { activeProtocol: s4, activeEncoding: r3 } = this._coreMouseService, o3 = this._coreService, { buffers: a3, cols: h3 } = this._bufferService, { active: c3, alt: l3 } = a3, d3 = this._optionsService.rawOptions, _3 = (e5) => e5 ? 1 : 2, u3 = e4.params[0];
            return f3 = u3, v3 = t4 ? 2 === u3 ? 4 : 4 === u3 ? _3(o3.modes.insertMode) : 12 === u3 ? 3 : 20 === u3 ? _3(d3.convertEol) : 0 : 1 === u3 ? _3(i4.applicationCursorKeys) : 3 === u3 ? d3.windowOptions.setWinLines ? 80 === h3 ? 2 : 132 === h3 ? 1 : 0 : 0 : 6 === u3 ? _3(i4.origin) : 7 === u3 ? _3(i4.wraparound) : 8 === u3 ? 3 : 9 === u3 ? _3("X10" === s4) : 12 === u3 ? _3(d3.cursorBlink) : 25 === u3 ? _3(!o3.isCursorHidden) : 45 === u3 ? _3(i4.reverseWraparound) : 66 === u3 ? _3(i4.applicationKeypad) : 67 === u3 ? 4 : 1e3 === u3 ? _3("VT200" === s4) : 1002 === u3 ? _3("DRAG" === s4) : 1003 === u3 ? _3("ANY" === s4) : 1004 === u3 ? _3(i4.sendFocus) : 1005 === u3 ? 4 : 1006 === u3 ? _3("SGR" === r3) : 1015 === u3 ? 4 : 1016 === u3 ? _3("SGR_PIXELS" === r3) : 1048 === u3 ? 1 : 47 === u3 || 1047 === u3 || 1049 === u3 ? _3(c3 === l3) : 2004 === u3 ? _3(i4.bracketedPasteMode) : 0, o3.triggerDataEvent(`${n2.C0.ESC}[${t4 ? "" : "?"}${f3};${v3}$y`), true;
            var f3, v3;
          }
          _updateAttrColor(e4, t4, i4, s4, r3) {
            return 2 === t4 ? (e4 |= 50331648, e4 &= -16777216, e4 |= f2.AttributeData.fromColorRGB([i4, s4, r3])) : 5 === t4 && (e4 &= -50331904, e4 |= 33554432 | 255 & i4), e4;
          }
          _extractColor(e4, t4, i4) {
            const s4 = [0, 0, -1, 0, 0, 0];
            let r3 = 0, n3 = 0;
            do {
              if (s4[n3 + r3] = e4.params[t4 + n3], e4.hasSubParams(t4 + n3)) {
                const i5 = e4.getSubParams(t4 + n3);
                let o3 = 0;
                do {
                  5 === s4[1] && (r3 = 1), s4[n3 + o3 + 1 + r3] = i5[o3];
                } while (++o3 < i5.length && o3 + n3 + 1 + r3 < s4.length);
                break;
              }
              if (5 === s4[1] && n3 + r3 >= 2 || 2 === s4[1] && n3 + r3 >= 5) break;
              s4[1] && (r3 = 1);
            } while (++n3 + t4 < e4.length && n3 + r3 < s4.length);
            for (let e5 = 2; e5 < s4.length; ++e5) -1 === s4[e5] && (s4[e5] = 0);
            switch (s4[0]) {
              case 38:
                i4.fg = this._updateAttrColor(i4.fg, s4[1], s4[3], s4[4], s4[5]);
                break;
              case 48:
                i4.bg = this._updateAttrColor(i4.bg, s4[1], s4[3], s4[4], s4[5]);
                break;
              case 58:
                i4.extended = i4.extended.clone(), i4.extended.underlineColor = this._updateAttrColor(i4.extended.underlineColor, s4[1], s4[3], s4[4], s4[5]);
            }
            return n3;
          }
          _processUnderline(e4, t4) {
            t4.extended = t4.extended.clone(), (!~e4 || e4 > 5) && (e4 = 1), t4.extended.underlineStyle = e4, t4.fg |= 268435456, 0 === e4 && (t4.fg &= -268435457), t4.updateExtended();
          }
          _processSGR0(e4) {
            e4.fg = l2.DEFAULT_ATTR_DATA.fg, e4.bg = l2.DEFAULT_ATTR_DATA.bg, e4.extended = e4.extended.clone(), e4.extended.underlineStyle = 0, e4.extended.underlineColor &= -67108864, e4.updateExtended();
          }
          charAttributes(e4) {
            if (1 === e4.length && 0 === e4.params[0]) return this._processSGR0(this._curAttrData), true;
            const t4 = e4.length;
            let i4;
            const s4 = this._curAttrData;
            for (let r3 = 0; r3 < t4; r3++) i4 = e4.params[r3], i4 >= 30 && i4 <= 37 ? (s4.fg &= -50331904, s4.fg |= 16777216 | i4 - 30) : i4 >= 40 && i4 <= 47 ? (s4.bg &= -50331904, s4.bg |= 16777216 | i4 - 40) : i4 >= 90 && i4 <= 97 ? (s4.fg &= -50331904, s4.fg |= 16777224 | i4 - 90) : i4 >= 100 && i4 <= 107 ? (s4.bg &= -50331904, s4.bg |= 16777224 | i4 - 100) : 0 === i4 ? this._processSGR0(s4) : 1 === i4 ? s4.fg |= 134217728 : 3 === i4 ? s4.bg |= 67108864 : 4 === i4 ? (s4.fg |= 268435456, this._processUnderline(e4.hasSubParams(r3) ? e4.getSubParams(r3)[0] : 1, s4)) : 5 === i4 ? s4.fg |= 536870912 : 7 === i4 ? s4.fg |= 67108864 : 8 === i4 ? s4.fg |= 1073741824 : 9 === i4 ? s4.fg |= 2147483648 : 2 === i4 ? s4.bg |= 134217728 : 21 === i4 ? this._processUnderline(2, s4) : 22 === i4 ? (s4.fg &= -134217729, s4.bg &= -134217729) : 23 === i4 ? s4.bg &= -67108865 : 24 === i4 ? (s4.fg &= -268435457, this._processUnderline(0, s4)) : 25 === i4 ? s4.fg &= -536870913 : 27 === i4 ? s4.fg &= -67108865 : 28 === i4 ? s4.fg &= -1073741825 : 29 === i4 ? s4.fg &= 2147483647 : 39 === i4 ? (s4.fg &= -67108864, s4.fg |= 16777215 & l2.DEFAULT_ATTR_DATA.fg) : 49 === i4 ? (s4.bg &= -67108864, s4.bg |= 16777215 & l2.DEFAULT_ATTR_DATA.bg) : 38 === i4 || 48 === i4 || 58 === i4 ? r3 += this._extractColor(e4, r3, s4) : 53 === i4 ? s4.bg |= 1073741824 : 55 === i4 ? s4.bg &= -1073741825 : 59 === i4 ? (s4.extended = s4.extended.clone(), s4.extended.underlineColor = -1, s4.updateExtended()) : 100 === i4 ? (s4.fg &= -67108864, s4.fg |= 16777215 & l2.DEFAULT_ATTR_DATA.fg, s4.bg &= -67108864, s4.bg |= 16777215 & l2.DEFAULT_ATTR_DATA.bg) : this._logService.debug("Unknown SGR attribute: %d.", i4);
            return true;
          }
          deviceStatus(e4) {
            switch (e4.params[0]) {
              case 5:
                this._coreService.triggerDataEvent(`${n2.C0.ESC}[0n`);
                break;
              case 6:
                const e5 = this._activeBuffer.y + 1, t4 = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${n2.C0.ESC}[${e5};${t4}R`);
            }
            return true;
          }
          deviceStatusPrivate(e4) {
            if (6 === e4.params[0]) {
              const e5 = this._activeBuffer.y + 1, t4 = this._activeBuffer.x + 1;
              this._coreService.triggerDataEvent(`${n2.C0.ESC}[?${e5};${t4}R`);
            }
            return true;
          }
          softReset(e4) {
            return this._coreService.isCursorHidden = false, this._onRequestSyncScrollBar.fire(), this._activeBuffer.scrollTop = 0, this._activeBuffer.scrollBottom = this._bufferService.rows - 1, this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._coreService.reset(), this._charsetService.reset(), this._activeBuffer.savedX = 0, this._activeBuffer.savedY = this._activeBuffer.ybase, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, this._coreService.decPrivateModes.origin = false, true;
          }
          setCursorStyle(e4) {
            const t4 = e4.params[0] || 1;
            switch (t4) {
              case 1:
              case 2:
                this._optionsService.options.cursorStyle = "block";
                break;
              case 3:
              case 4:
                this._optionsService.options.cursorStyle = "underline";
                break;
              case 5:
              case 6:
                this._optionsService.options.cursorStyle = "bar";
            }
            const i4 = t4 % 2 == 1;
            return this._optionsService.options.cursorBlink = i4, true;
          }
          setScrollRegion(e4) {
            const t4 = e4.params[0] || 1;
            let i4;
            return (e4.length < 2 || (i4 = e4.params[1]) > this._bufferService.rows || 0 === i4) && (i4 = this._bufferService.rows), i4 > t4 && (this._activeBuffer.scrollTop = t4 - 1, this._activeBuffer.scrollBottom = i4 - 1, this._setCursor(0, 0)), true;
          }
          windowOptions(e4) {
            if (!w2(e4.params[0], this._optionsService.rawOptions.windowOptions)) return true;
            const t4 = e4.length > 1 ? e4.params[1] : 0;
            switch (e4.params[0]) {
              case 14:
                2 !== t4 && this._onRequestWindowsOptionsReport.fire(y2.GET_WIN_SIZE_PIXELS);
                break;
              case 16:
                this._onRequestWindowsOptionsReport.fire(y2.GET_CELL_SIZE_PIXELS);
                break;
              case 18:
                this._bufferService && this._coreService.triggerDataEvent(`${n2.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
                break;
              case 22:
                0 !== t4 && 2 !== t4 || (this._windowTitleStack.push(this._windowTitle), this._windowTitleStack.length > 10 && this._windowTitleStack.shift()), 0 !== t4 && 1 !== t4 || (this._iconNameStack.push(this._iconName), this._iconNameStack.length > 10 && this._iconNameStack.shift());
                break;
              case 23:
                0 !== t4 && 2 !== t4 || this._windowTitleStack.length && this.setTitle(this._windowTitleStack.pop()), 0 !== t4 && 1 !== t4 || this._iconNameStack.length && this.setIconName(this._iconNameStack.pop());
            }
            return true;
          }
          saveCursor(e4) {
            return this._activeBuffer.savedX = this._activeBuffer.x, this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg, this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg, this._activeBuffer.savedCharset = this._charsetService.charset, true;
          }
          restoreCursor(e4) {
            return this._activeBuffer.x = this._activeBuffer.savedX || 0, this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0), this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg, this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg, this._charsetService.charset = this._savedCharset, this._activeBuffer.savedCharset && (this._charsetService.charset = this._activeBuffer.savedCharset), this._restrictCursor(), true;
          }
          setTitle(e4) {
            return this._windowTitle = e4, this._onTitleChange.fire(e4), true;
          }
          setIconName(e4) {
            return this._iconName = e4, true;
          }
          setOrReportIndexedColor(e4) {
            const t4 = [], i4 = e4.split(";");
            for (; i4.length > 1; ) {
              const e5 = i4.shift(), s4 = i4.shift();
              if (/^\d+$/.exec(e5)) {
                const i5 = parseInt(e5);
                if (D2(i5)) if ("?" === s4) t4.push({ type: 0, index: i5 });
                else {
                  const e6 = (0, S2.parseColor)(s4);
                  e6 && t4.push({ type: 1, index: i5, color: e6 });
                }
              }
            }
            return t4.length && this._onColor.fire(t4), true;
          }
          setHyperlink(e4) {
            const t4 = e4.split(";");
            return !(t4.length < 2) && (t4[1] ? this._createHyperlink(t4[0], t4[1]) : !t4[0] && this._finishHyperlink());
          }
          _createHyperlink(e4, t4) {
            this._getCurrentLinkId() && this._finishHyperlink();
            const i4 = e4.split(":");
            let s4;
            const r3 = i4.findIndex(((e5) => e5.startsWith("id=")));
            return -1 !== r3 && (s4 = i4[r3].slice(3) || void 0), this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id: s4, uri: t4 }), this._curAttrData.updateExtended(), true;
          }
          _finishHyperlink() {
            return this._curAttrData.extended = this._curAttrData.extended.clone(), this._curAttrData.extended.urlId = 0, this._curAttrData.updateExtended(), true;
          }
          _setOrReportSpecialColor(e4, t4) {
            const i4 = e4.split(";");
            for (let e5 = 0; e5 < i4.length && !(t4 >= this._specialColors.length); ++e5, ++t4) if ("?" === i4[e5]) this._onColor.fire([{ type: 0, index: this._specialColors[t4] }]);
            else {
              const s4 = (0, S2.parseColor)(i4[e5]);
              s4 && this._onColor.fire([{ type: 1, index: this._specialColors[t4], color: s4 }]);
            }
            return true;
          }
          setOrReportFgColor(e4) {
            return this._setOrReportSpecialColor(e4, 0);
          }
          setOrReportBgColor(e4) {
            return this._setOrReportSpecialColor(e4, 1);
          }
          setOrReportCursorColor(e4) {
            return this._setOrReportSpecialColor(e4, 2);
          }
          restoreIndexedColor(e4) {
            if (!e4) return this._onColor.fire([{ type: 2 }]), true;
            const t4 = [], i4 = e4.split(";");
            for (let e5 = 0; e5 < i4.length; ++e5) if (/^\d+$/.exec(i4[e5])) {
              const s4 = parseInt(i4[e5]);
              D2(s4) && t4.push({ type: 2, index: s4 });
            }
            return t4.length && this._onColor.fire(t4), true;
          }
          restoreFgColor(e4) {
            return this._onColor.fire([{ type: 2, index: 256 }]), true;
          }
          restoreBgColor(e4) {
            return this._onColor.fire([{ type: 2, index: 257 }]), true;
          }
          restoreCursorColor(e4) {
            return this._onColor.fire([{ type: 2, index: 258 }]), true;
          }
          nextLine() {
            return this._activeBuffer.x = 0, this.index(), true;
          }
          keypadApplicationMode() {
            return this._logService.debug("Serial port requested application keypad."), this._coreService.decPrivateModes.applicationKeypad = true, this._onRequestSyncScrollBar.fire(), true;
          }
          keypadNumericMode() {
            return this._logService.debug("Switching back to normal keypad."), this._coreService.decPrivateModes.applicationKeypad = false, this._onRequestSyncScrollBar.fire(), true;
          }
          selectDefaultCharset() {
            return this._charsetService.setgLevel(0), this._charsetService.setgCharset(0, o2.DEFAULT_CHARSET), true;
          }
          selectCharset(e4) {
            return 2 !== e4.length ? (this.selectDefaultCharset(), true) : ("/" === e4[0] || this._charsetService.setgCharset(C2[e4[0]], o2.CHARSETS[e4[1]] || o2.DEFAULT_CHARSET), true);
          }
          index() {
            return this._restrictCursor(), this._activeBuffer.y++, this._activeBuffer.y === this._activeBuffer.scrollBottom + 1 ? (this._activeBuffer.y--, this._bufferService.scroll(this._eraseAttrData())) : this._activeBuffer.y >= this._bufferService.rows && (this._activeBuffer.y = this._bufferService.rows - 1), this._restrictCursor(), true;
          }
          tabSet() {
            return this._activeBuffer.tabs[this._activeBuffer.x] = true, true;
          }
          reverseIndex() {
            if (this._restrictCursor(), this._activeBuffer.y === this._activeBuffer.scrollTop) {
              const e4 = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
              this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, e4, 1), this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData())), this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
            } else this._activeBuffer.y--, this._restrictCursor();
            return true;
          }
          fullReset() {
            return this._parser.reset(), this._onRequestReset.fire(), true;
          }
          reset() {
            this._curAttrData = l2.DEFAULT_ATTR_DATA.clone(), this._eraseAttrDataInternal = l2.DEFAULT_ATTR_DATA.clone();
          }
          _eraseAttrData() {
            return this._eraseAttrDataInternal.bg &= -67108864, this._eraseAttrDataInternal.bg |= 67108863 & this._curAttrData.bg, this._eraseAttrDataInternal;
          }
          setgLevel(e4) {
            return this._charsetService.setgLevel(e4), true;
          }
          screenAlignmentPattern() {
            const e4 = new u2.CellData();
            e4.content = 1 << 22 | "E".charCodeAt(0), e4.fg = this._curAttrData.fg, e4.bg = this._curAttrData.bg, this._setCursor(0, 0);
            for (let t4 = 0; t4 < this._bufferService.rows; ++t4) {
              const i4 = this._activeBuffer.ybase + this._activeBuffer.y + t4, s4 = this._activeBuffer.lines.get(i4);
              s4 && (s4.fill(e4), s4.isWrapped = false);
            }
            return this._dirtyRowTracker.markAllDirty(), this._setCursor(0, 0), true;
          }
          requestStatusString(e4, t4) {
            const i4 = this._bufferService.buffer, s4 = this._optionsService.rawOptions;
            return ((e5) => (this._coreService.triggerDataEvent(`${n2.C0.ESC}${e5}${n2.C0.ESC}\\`), true))('"q' === e4 ? `P1$r${this._curAttrData.isProtected() ? 1 : 0}"q` : '"p' === e4 ? 'P1$r61;1"p' : "r" === e4 ? `P1$r${i4.scrollTop + 1};${i4.scrollBottom + 1}r` : "m" === e4 ? "P1$r0m" : " q" === e4 ? `P1$r${{ block: 2, underline: 4, bar: 6 }[s4.cursorStyle] - (s4.cursorBlink ? 1 : 0)} q` : "P0$r");
          }
          markRangeDirty(e4, t4) {
            this._dirtyRowTracker.markRangeDirty(e4, t4);
          }
        }
        t3.InputHandler = k2;
        let L2 = class {
          constructor(e4) {
            this._bufferService = e4, this.clearRange();
          }
          clearRange() {
            this.start = this._bufferService.buffer.y, this.end = this._bufferService.buffer.y;
          }
          markDirty(e4) {
            e4 < this.start ? this.start = e4 : e4 > this.end && (this.end = e4);
          }
          markRangeDirty(e4, t4) {
            e4 > t4 && (E2 = e4, e4 = t4, t4 = E2), e4 < this.start && (this.start = e4), t4 > this.end && (this.end = t4);
          }
          markAllDirty() {
            this.markRangeDirty(0, this._bufferService.rows - 1);
          }
        };
        function D2(e4) {
          return 0 <= e4 && e4 < 256;
        }
        L2 = s3([r2(0, v2.IBufferService)], L2);
      }, 844: (e3, t3) => {
        function i3(e4) {
          for (const t4 of e4) t4.dispose();
          e4.length = 0;
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.getDisposeArrayDisposable = t3.disposeArray = t3.toDisposable = t3.MutableDisposable = t3.Disposable = void 0, t3.Disposable = class {
          constructor() {
            this._disposables = [], this._isDisposed = false;
          }
          dispose() {
            this._isDisposed = true;
            for (const e4 of this._disposables) e4.dispose();
            this._disposables.length = 0;
          }
          register(e4) {
            return this._disposables.push(e4), e4;
          }
          unregister(e4) {
            const t4 = this._disposables.indexOf(e4);
            -1 !== t4 && this._disposables.splice(t4, 1);
          }
        }, t3.MutableDisposable = class {
          constructor() {
            this._isDisposed = false;
          }
          get value() {
            return this._isDisposed ? void 0 : this._value;
          }
          set value(e4) {
            this._isDisposed || e4 === this._value || (this._value?.dispose(), this._value = e4);
          }
          clear() {
            this.value = void 0;
          }
          dispose() {
            this._isDisposed = true, this._value?.dispose(), this._value = void 0;
          }
        }, t3.toDisposable = function(e4) {
          return { dispose: e4 };
        }, t3.disposeArray = i3, t3.getDisposeArrayDisposable = function(e4) {
          return { dispose: () => i3(e4) };
        };
      }, 1505: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.FourKeyMap = t3.TwoKeyMap = void 0;
        class i3 {
          constructor() {
            this._data = {};
          }
          set(e4, t4, i4) {
            this._data[e4] || (this._data[e4] = {}), this._data[e4][t4] = i4;
          }
          get(e4, t4) {
            return this._data[e4] ? this._data[e4][t4] : void 0;
          }
          clear() {
            this._data = {};
          }
        }
        t3.TwoKeyMap = i3, t3.FourKeyMap = class {
          constructor() {
            this._data = new i3();
          }
          set(e4, t4, s3, r2, n2) {
            this._data.get(e4, t4) || this._data.set(e4, t4, new i3()), this._data.get(e4, t4).set(s3, r2, n2);
          }
          get(e4, t4, i4, s3) {
            return this._data.get(e4, t4)?.get(i4, s3);
          }
          clear() {
            this._data.clear();
          }
        };
      }, 6114: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.isChromeOS = t3.isLinux = t3.isWindows = t3.isIphone = t3.isIpad = t3.isMac = t3.getSafariVersion = t3.isSafari = t3.isLegacyEdge = t3.isFirefox = t3.isNode = void 0, t3.isNode = "undefined" != typeof process && "title" in process;
        const i3 = t3.isNode ? "node" : navigator.userAgent, s3 = t3.isNode ? "node" : navigator.platform;
        t3.isFirefox = i3.includes("Firefox"), t3.isLegacyEdge = i3.includes("Edge"), t3.isSafari = /^((?!chrome|android).)*safari/i.test(i3), t3.getSafariVersion = function() {
          if (!t3.isSafari) return 0;
          const e4 = i3.match(/Version\/(\d+)/);
          return null === e4 || e4.length < 2 ? 0 : parseInt(e4[1]);
        }, t3.isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(s3), t3.isIpad = "iPad" === s3, t3.isIphone = "iPhone" === s3, t3.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(s3), t3.isLinux = s3.indexOf("Linux") >= 0, t3.isChromeOS = /\bCrOS\b/.test(i3);
      }, 6106: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.SortedList = void 0;
        let i3 = 0;
        t3.SortedList = class {
          constructor(e4) {
            this._getKey = e4, this._array = [];
          }
          clear() {
            this._array.length = 0;
          }
          insert(e4) {
            0 !== this._array.length ? (i3 = this._search(this._getKey(e4)), this._array.splice(i3, 0, e4)) : this._array.push(e4);
          }
          delete(e4) {
            if (0 === this._array.length) return false;
            const t4 = this._getKey(e4);
            if (void 0 === t4) return false;
            if (i3 = this._search(t4), -1 === i3) return false;
            if (this._getKey(this._array[i3]) !== t4) return false;
            do {
              if (this._array[i3] === e4) return this._array.splice(i3, 1), true;
            } while (++i3 < this._array.length && this._getKey(this._array[i3]) === t4);
            return false;
          }
          *getKeyIterator(e4) {
            if (0 !== this._array.length && (i3 = this._search(e4), !(i3 < 0 || i3 >= this._array.length) && this._getKey(this._array[i3]) === e4)) do {
              yield this._array[i3];
            } while (++i3 < this._array.length && this._getKey(this._array[i3]) === e4);
          }
          forEachByKey(e4, t4) {
            if (0 !== this._array.length && (i3 = this._search(e4), !(i3 < 0 || i3 >= this._array.length) && this._getKey(this._array[i3]) === e4)) do {
              t4(this._array[i3]);
            } while (++i3 < this._array.length && this._getKey(this._array[i3]) === e4);
          }
          values() {
            return [...this._array].values();
          }
          _search(e4) {
            let t4 = 0, i4 = this._array.length - 1;
            for (; i4 >= t4; ) {
              let s3 = t4 + i4 >> 1;
              const r2 = this._getKey(this._array[s3]);
              if (r2 > e4) i4 = s3 - 1;
              else {
                if (!(r2 < e4)) {
                  for (; s3 > 0 && this._getKey(this._array[s3 - 1]) === e4; ) s3--;
                  return s3;
                }
                t4 = s3 + 1;
              }
            }
            return t4;
          }
        };
      }, 7226: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DebouncedIdleTask = t3.IdleTaskQueue = t3.PriorityTaskQueue = void 0;
        const s3 = i3(6114);
        class r2 {
          constructor() {
            this._tasks = [], this._i = 0;
          }
          enqueue(e4) {
            this._tasks.push(e4), this._start();
          }
          flush() {
            for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
            this.clear();
          }
          clear() {
            this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
          }
          _start() {
            this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
          }
          _process(e4) {
            this._idleCallback = void 0;
            let t4 = 0, i4 = 0, s4 = e4.timeRemaining(), r3 = 0;
            for (; this._i < this._tasks.length; ) {
              if (t4 = Date.now(), this._tasks[this._i]() || this._i++, t4 = Math.max(1, Date.now() - t4), i4 = Math.max(t4, i4), r3 = e4.timeRemaining(), 1.5 * i4 > r3) return s4 - t4 < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s4 - t4))}ms`), void this._start();
              s4 = r3;
            }
            this.clear();
          }
        }
        class n2 extends r2 {
          _requestCallback(e4) {
            return setTimeout((() => e4(this._createDeadline(16))));
          }
          _cancelCallback(e4) {
            clearTimeout(e4);
          }
          _createDeadline(e4) {
            const t4 = Date.now() + e4;
            return { timeRemaining: () => Math.max(0, t4 - Date.now()) };
          }
        }
        t3.PriorityTaskQueue = n2, t3.IdleTaskQueue = !s3.isNode && "requestIdleCallback" in window ? class extends r2 {
          _requestCallback(e4) {
            return requestIdleCallback(e4);
          }
          _cancelCallback(e4) {
            cancelIdleCallback(e4);
          }
        } : n2, t3.DebouncedIdleTask = class {
          constructor() {
            this._queue = new t3.IdleTaskQueue();
          }
          set(e4) {
            this._queue.clear(), this._queue.enqueue(e4);
          }
          flush() {
            this._queue.flush();
          }
        };
      }, 9282: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.updateWindowsModeWrappedState = void 0;
        const s3 = i3(643);
        t3.updateWindowsModeWrappedState = function(e4) {
          const t4 = e4.buffer.lines.get(e4.buffer.ybase + e4.buffer.y - 1), i4 = t4?.get(e4.cols - 1), r2 = e4.buffer.lines.get(e4.buffer.ybase + e4.buffer.y);
          r2 && i4 && (r2.isWrapped = i4[s3.CHAR_DATA_CODE_INDEX] !== s3.NULL_CELL_CODE && i4[s3.CHAR_DATA_CODE_INDEX] !== s3.WHITESPACE_CELL_CODE);
        };
      }, 3734: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ExtendedAttrs = t3.AttributeData = void 0;
        class i3 {
          constructor() {
            this.fg = 0, this.bg = 0, this.extended = new s3();
          }
          static toColorRGB(e4) {
            return [e4 >>> 16 & 255, e4 >>> 8 & 255, 255 & e4];
          }
          static fromColorRGB(e4) {
            return (255 & e4[0]) << 16 | (255 & e4[1]) << 8 | 255 & e4[2];
          }
          clone() {
            const e4 = new i3();
            return e4.fg = this.fg, e4.bg = this.bg, e4.extended = this.extended.clone(), e4;
          }
          isInverse() {
            return 67108864 & this.fg;
          }
          isBold() {
            return 134217728 & this.fg;
          }
          isUnderline() {
            return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
          }
          isBlink() {
            return 536870912 & this.fg;
          }
          isInvisible() {
            return 1073741824 & this.fg;
          }
          isItalic() {
            return 67108864 & this.bg;
          }
          isDim() {
            return 134217728 & this.bg;
          }
          isStrikethrough() {
            return 2147483648 & this.fg;
          }
          isProtected() {
            return 536870912 & this.bg;
          }
          isOverline() {
            return 1073741824 & this.bg;
          }
          getFgColorMode() {
            return 50331648 & this.fg;
          }
          getBgColorMode() {
            return 50331648 & this.bg;
          }
          isFgRGB() {
            return 50331648 == (50331648 & this.fg);
          }
          isBgRGB() {
            return 50331648 == (50331648 & this.bg);
          }
          isFgPalette() {
            return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
          }
          isBgPalette() {
            return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
          }
          isFgDefault() {
            return 0 == (50331648 & this.fg);
          }
          isBgDefault() {
            return 0 == (50331648 & this.bg);
          }
          isAttributeDefault() {
            return 0 === this.fg && 0 === this.bg;
          }
          getFgColor() {
            switch (50331648 & this.fg) {
              case 16777216:
              case 33554432:
                return 255 & this.fg;
              case 50331648:
                return 16777215 & this.fg;
              default:
                return -1;
            }
          }
          getBgColor() {
            switch (50331648 & this.bg) {
              case 16777216:
              case 33554432:
                return 255 & this.bg;
              case 50331648:
                return 16777215 & this.bg;
              default:
                return -1;
            }
          }
          hasExtendedAttrs() {
            return 268435456 & this.bg;
          }
          updateExtended() {
            this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
          }
          getUnderlineColor() {
            if (268435456 & this.bg && ~this.extended.underlineColor) switch (50331648 & this.extended.underlineColor) {
              case 16777216:
              case 33554432:
                return 255 & this.extended.underlineColor;
              case 50331648:
                return 16777215 & this.extended.underlineColor;
              default:
                return this.getFgColor();
            }
            return this.getFgColor();
          }
          getUnderlineColorMode() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
          }
          isUnderlineColorRGB() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 == (50331648 & this.extended.underlineColor) : this.isFgRGB();
          }
          isUnderlineColorPalette() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
          }
          isUnderlineColorDefault() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 0 == (50331648 & this.extended.underlineColor) : this.isFgDefault();
          }
          getUnderlineStyle() {
            return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
          }
          getUnderlineVariantOffset() {
            return this.extended.underlineVariantOffset;
          }
        }
        t3.AttributeData = i3;
        class s3 {
          get ext() {
            return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
          }
          set ext(e4) {
            this._ext = e4;
          }
          get underlineStyle() {
            return this._urlId ? 5 : (469762048 & this._ext) >> 26;
          }
          set underlineStyle(e4) {
            this._ext &= -469762049, this._ext |= e4 << 26 & 469762048;
          }
          get underlineColor() {
            return 67108863 & this._ext;
          }
          set underlineColor(e4) {
            this._ext &= -67108864, this._ext |= 67108863 & e4;
          }
          get urlId() {
            return this._urlId;
          }
          set urlId(e4) {
            this._urlId = e4;
          }
          get underlineVariantOffset() {
            const e4 = (3758096384 & this._ext) >> 29;
            return e4 < 0 ? 4294967288 ^ e4 : e4;
          }
          set underlineVariantOffset(e4) {
            this._ext &= 536870911, this._ext |= e4 << 29 & 3758096384;
          }
          constructor(e4 = 0, t4 = 0) {
            this._ext = 0, this._urlId = 0, this._ext = e4, this._urlId = t4;
          }
          clone() {
            return new s3(this._ext, this._urlId);
          }
          isEmpty() {
            return 0 === this.underlineStyle && 0 === this._urlId;
          }
        }
        t3.ExtendedAttrs = s3;
      }, 9092: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Buffer = t3.MAX_BUFFER_SIZE = void 0;
        const s3 = i3(6349), r2 = i3(7226), n2 = i3(3734), o2 = i3(8437), a2 = i3(4634), h2 = i3(511), c2 = i3(643), l2 = i3(4863), d2 = i3(7116);
        t3.MAX_BUFFER_SIZE = 4294967295, t3.Buffer = class {
          constructor(e4, t4, i4) {
            this._hasScrollback = e4, this._optionsService = t4, this._bufferService = i4, this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.tabs = {}, this.savedY = 0, this.savedX = 0, this.savedCurAttrData = o2.DEFAULT_ATTR_DATA.clone(), this.savedCharset = d2.DEFAULT_CHARSET, this.markers = [], this._nullCell = h2.CellData.fromCharData([0, c2.NULL_CELL_CHAR, c2.NULL_CELL_WIDTH, c2.NULL_CELL_CODE]), this._whitespaceCell = h2.CellData.fromCharData([0, c2.WHITESPACE_CELL_CHAR, c2.WHITESPACE_CELL_WIDTH, c2.WHITESPACE_CELL_CODE]), this._isClearing = false, this._memoryCleanupQueue = new r2.IdleTaskQueue(), this._memoryCleanupPosition = 0, this._cols = this._bufferService.cols, this._rows = this._bufferService.rows, this.lines = new s3.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          getNullCell(e4) {
            return e4 ? (this._nullCell.fg = e4.fg, this._nullCell.bg = e4.bg, this._nullCell.extended = e4.extended) : (this._nullCell.fg = 0, this._nullCell.bg = 0, this._nullCell.extended = new n2.ExtendedAttrs()), this._nullCell;
          }
          getWhitespaceCell(e4) {
            return e4 ? (this._whitespaceCell.fg = e4.fg, this._whitespaceCell.bg = e4.bg, this._whitespaceCell.extended = e4.extended) : (this._whitespaceCell.fg = 0, this._whitespaceCell.bg = 0, this._whitespaceCell.extended = new n2.ExtendedAttrs()), this._whitespaceCell;
          }
          getBlankLine(e4, t4) {
            return new o2.BufferLine(this._bufferService.cols, this.getNullCell(e4), t4);
          }
          get hasScrollback() {
            return this._hasScrollback && this.lines.maxLength > this._rows;
          }
          get isCursorInViewport() {
            const e4 = this.ybase + this.y - this.ydisp;
            return e4 >= 0 && e4 < this._rows;
          }
          _getCorrectBufferLength(e4) {
            if (!this._hasScrollback) return e4;
            const i4 = e4 + this._optionsService.rawOptions.scrollback;
            return i4 > t3.MAX_BUFFER_SIZE ? t3.MAX_BUFFER_SIZE : i4;
          }
          fillViewportRows(e4) {
            if (0 === this.lines.length) {
              void 0 === e4 && (e4 = o2.DEFAULT_ATTR_DATA);
              let t4 = this._rows;
              for (; t4--; ) this.lines.push(this.getBlankLine(e4));
            }
          }
          clear() {
            this.ydisp = 0, this.ybase = 0, this.y = 0, this.x = 0, this.lines = new s3.CircularList(this._getCorrectBufferLength(this._rows)), this.scrollTop = 0, this.scrollBottom = this._rows - 1, this.setupTabStops();
          }
          resize(e4, t4) {
            const i4 = this.getNullCell(o2.DEFAULT_ATTR_DATA);
            let s4 = 0;
            const r3 = this._getCorrectBufferLength(t4);
            if (r3 > this.lines.maxLength && (this.lines.maxLength = r3), this.lines.length > 0) {
              if (this._cols < e4) for (let t5 = 0; t5 < this.lines.length; t5++) s4 += +this.lines.get(t5).resize(e4, i4);
              let n3 = 0;
              if (this._rows < t4) for (let s5 = this._rows; s5 < t4; s5++) this.lines.length < t4 + this.ybase && (this._optionsService.rawOptions.windowsMode || void 0 !== this._optionsService.rawOptions.windowsPty.backend || void 0 !== this._optionsService.rawOptions.windowsPty.buildNumber ? this.lines.push(new o2.BufferLine(e4, i4)) : this.ybase > 0 && this.lines.length <= this.ybase + this.y + n3 + 1 ? (this.ybase--, n3++, this.ydisp > 0 && this.ydisp--) : this.lines.push(new o2.BufferLine(e4, i4)));
              else for (let e5 = this._rows; e5 > t4; e5--) this.lines.length > t4 + this.ybase && (this.lines.length > this.ybase + this.y + 1 ? this.lines.pop() : (this.ybase++, this.ydisp++));
              if (r3 < this.lines.maxLength) {
                const e5 = this.lines.length - r3;
                e5 > 0 && (this.lines.trimStart(e5), this.ybase = Math.max(this.ybase - e5, 0), this.ydisp = Math.max(this.ydisp - e5, 0), this.savedY = Math.max(this.savedY - e5, 0)), this.lines.maxLength = r3;
              }
              this.x = Math.min(this.x, e4 - 1), this.y = Math.min(this.y, t4 - 1), n3 && (this.y += n3), this.savedX = Math.min(this.savedX, e4 - 1), this.scrollTop = 0;
            }
            if (this.scrollBottom = t4 - 1, this._isReflowEnabled && (this._reflow(e4, t4), this._cols > e4)) for (let t5 = 0; t5 < this.lines.length; t5++) s4 += +this.lines.get(t5).resize(e4, i4);
            this._cols = e4, this._rows = t4, this._memoryCleanupQueue.clear(), s4 > 0.1 * this.lines.length && (this._memoryCleanupPosition = 0, this._memoryCleanupQueue.enqueue((() => this._batchedMemoryCleanup())));
          }
          _batchedMemoryCleanup() {
            let e4 = true;
            this._memoryCleanupPosition >= this.lines.length && (this._memoryCleanupPosition = 0, e4 = false);
            let t4 = 0;
            for (; this._memoryCleanupPosition < this.lines.length; ) if (t4 += this.lines.get(this._memoryCleanupPosition++).cleanupMemory(), t4 > 100) return true;
            return e4;
          }
          get _isReflowEnabled() {
            const e4 = this._optionsService.rawOptions.windowsPty;
            return e4 && e4.buildNumber ? this._hasScrollback && "conpty" === e4.backend && e4.buildNumber >= 21376 : this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
          }
          _reflow(e4, t4) {
            this._cols !== e4 && (e4 > this._cols ? this._reflowLarger(e4, t4) : this._reflowSmaller(e4, t4));
          }
          _reflowLarger(e4, t4) {
            const i4 = (0, a2.reflowLargerGetLinesToRemove)(this.lines, this._cols, e4, this.ybase + this.y, this.getNullCell(o2.DEFAULT_ATTR_DATA));
            if (i4.length > 0) {
              const s4 = (0, a2.reflowLargerCreateNewLayout)(this.lines, i4);
              (0, a2.reflowLargerApplyNewLayout)(this.lines, s4.layout), this._reflowLargerAdjustViewport(e4, t4, s4.countRemoved);
            }
          }
          _reflowLargerAdjustViewport(e4, t4, i4) {
            const s4 = this.getNullCell(o2.DEFAULT_ATTR_DATA);
            let r3 = i4;
            for (; r3-- > 0; ) 0 === this.ybase ? (this.y > 0 && this.y--, this.lines.length < t4 && this.lines.push(new o2.BufferLine(e4, s4))) : (this.ydisp === this.ybase && this.ydisp--, this.ybase--);
            this.savedY = Math.max(this.savedY - i4, 0);
          }
          _reflowSmaller(e4, t4) {
            const i4 = this.getNullCell(o2.DEFAULT_ATTR_DATA), s4 = [];
            let r3 = 0;
            for (let n3 = this.lines.length - 1; n3 >= 0; n3--) {
              let h3 = this.lines.get(n3);
              if (!h3 || !h3.isWrapped && h3.getTrimmedLength() <= e4) continue;
              const c3 = [h3];
              for (; h3.isWrapped && n3 > 0; ) h3 = this.lines.get(--n3), c3.unshift(h3);
              const l3 = this.ybase + this.y;
              if (l3 >= n3 && l3 < n3 + c3.length) continue;
              const d3 = c3[c3.length - 1].getTrimmedLength(), _2 = (0, a2.reflowSmallerGetNewLineLengths)(c3, this._cols, e4), u2 = _2.length - c3.length;
              let f2;
              f2 = 0 === this.ybase && this.y !== this.lines.length - 1 ? Math.max(0, this.y - this.lines.maxLength + u2) : Math.max(0, this.lines.length - this.lines.maxLength + u2);
              const v2 = [];
              for (let e5 = 0; e5 < u2; e5++) {
                const e6 = this.getBlankLine(o2.DEFAULT_ATTR_DATA, true);
                v2.push(e6);
              }
              v2.length > 0 && (s4.push({ start: n3 + c3.length + r3, newLines: v2 }), r3 += v2.length), c3.push(...v2);
              let p2 = _2.length - 1, g2 = _2[p2];
              0 === g2 && (p2--, g2 = _2[p2]);
              let m2 = c3.length - u2 - 1, S2 = d3;
              for (; m2 >= 0; ) {
                const e5 = Math.min(S2, g2);
                if (void 0 === c3[p2]) break;
                if (c3[p2].copyCellsFrom(c3[m2], S2 - e5, g2 - e5, e5, true), g2 -= e5, 0 === g2 && (p2--, g2 = _2[p2]), S2 -= e5, 0 === S2) {
                  m2--;
                  const e6 = Math.max(m2, 0);
                  S2 = (0, a2.getWrappedLineTrimmedLength)(c3, e6, this._cols);
                }
              }
              for (let t5 = 0; t5 < c3.length; t5++) _2[t5] < e4 && c3[t5].setCell(_2[t5], i4);
              let C2 = u2 - f2;
              for (; C2-- > 0; ) 0 === this.ybase ? this.y < t4 - 1 ? (this.y++, this.lines.pop()) : (this.ybase++, this.ydisp++) : this.ybase < Math.min(this.lines.maxLength, this.lines.length + r3) - t4 && (this.ybase === this.ydisp && this.ydisp++, this.ybase++);
              this.savedY = Math.min(this.savedY + u2, this.ybase + t4 - 1);
            }
            if (s4.length > 0) {
              const e5 = [], t5 = [];
              for (let e6 = 0; e6 < this.lines.length; e6++) t5.push(this.lines.get(e6));
              const i5 = this.lines.length;
              let n3 = i5 - 1, o3 = 0, a3 = s4[o3];
              this.lines.length = Math.min(this.lines.maxLength, this.lines.length + r3);
              let h3 = 0;
              for (let c4 = Math.min(this.lines.maxLength - 1, i5 + r3 - 1); c4 >= 0; c4--) if (a3 && a3.start > n3 + h3) {
                for (let e6 = a3.newLines.length - 1; e6 >= 0; e6--) this.lines.set(c4--, a3.newLines[e6]);
                c4++, e5.push({ index: n3 + 1, amount: a3.newLines.length }), h3 += a3.newLines.length, a3 = s4[++o3];
              } else this.lines.set(c4, t5[n3--]);
              let c3 = 0;
              for (let t6 = e5.length - 1; t6 >= 0; t6--) e5[t6].index += c3, this.lines.onInsertEmitter.fire(e5[t6]), c3 += e5[t6].amount;
              const l3 = Math.max(0, i5 + r3 - this.lines.maxLength);
              l3 > 0 && this.lines.onTrimEmitter.fire(l3);
            }
          }
          translateBufferLineToString(e4, t4, i4 = 0, s4) {
            const r3 = this.lines.get(e4);
            return r3 ? r3.translateToString(t4, i4, s4) : "";
          }
          getWrappedRangeForLine(e4) {
            let t4 = e4, i4 = e4;
            for (; t4 > 0 && this.lines.get(t4).isWrapped; ) t4--;
            for (; i4 + 1 < this.lines.length && this.lines.get(i4 + 1).isWrapped; ) i4++;
            return { first: t4, last: i4 };
          }
          setupTabStops(e4) {
            for (null != e4 ? this.tabs[e4] || (e4 = this.prevStop(e4)) : (this.tabs = {}, e4 = 0); e4 < this._cols; e4 += this._optionsService.rawOptions.tabStopWidth) this.tabs[e4] = true;
          }
          prevStop(e4) {
            for (null == e4 && (e4 = this.x); !this.tabs[--e4] && e4 > 0; ) ;
            return e4 >= this._cols ? this._cols - 1 : e4 < 0 ? 0 : e4;
          }
          nextStop(e4) {
            for (null == e4 && (e4 = this.x); !this.tabs[++e4] && e4 < this._cols; ) ;
            return e4 >= this._cols ? this._cols - 1 : e4 < 0 ? 0 : e4;
          }
          clearMarkers(e4) {
            this._isClearing = true;
            for (let t4 = 0; t4 < this.markers.length; t4++) this.markers[t4].line === e4 && (this.markers[t4].dispose(), this.markers.splice(t4--, 1));
            this._isClearing = false;
          }
          clearAllMarkers() {
            this._isClearing = true;
            for (let e4 = 0; e4 < this.markers.length; e4++) this.markers[e4].dispose(), this.markers.splice(e4--, 1);
            this._isClearing = false;
          }
          addMarker(e4) {
            const t4 = new l2.Marker(e4);
            return this.markers.push(t4), t4.register(this.lines.onTrim(((e5) => {
              t4.line -= e5, t4.line < 0 && t4.dispose();
            }))), t4.register(this.lines.onInsert(((e5) => {
              t4.line >= e5.index && (t4.line += e5.amount);
            }))), t4.register(this.lines.onDelete(((e5) => {
              t4.line >= e5.index && t4.line < e5.index + e5.amount && t4.dispose(), t4.line > e5.index && (t4.line -= e5.amount);
            }))), t4.register(t4.onDispose((() => this._removeMarker(t4)))), t4;
          }
          _removeMarker(e4) {
            this._isClearing || this.markers.splice(this.markers.indexOf(e4), 1);
          }
        };
      }, 8437: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferLine = t3.DEFAULT_ATTR_DATA = void 0;
        const s3 = i3(3734), r2 = i3(511), n2 = i3(643), o2 = i3(482);
        t3.DEFAULT_ATTR_DATA = Object.freeze(new s3.AttributeData());
        let a2 = 0;
        class h2 {
          constructor(e4, t4, i4 = false) {
            this.isWrapped = i4, this._combined = {}, this._extendedAttrs = {}, this._data = new Uint32Array(3 * e4);
            const s4 = t4 || r2.CellData.fromCharData([0, n2.NULL_CELL_CHAR, n2.NULL_CELL_WIDTH, n2.NULL_CELL_CODE]);
            for (let t5 = 0; t5 < e4; ++t5) this.setCell(t5, s4);
            this.length = e4;
          }
          get(e4) {
            const t4 = this._data[3 * e4 + 0], i4 = 2097151 & t4;
            return [this._data[3 * e4 + 1], 2097152 & t4 ? this._combined[e4] : i4 ? (0, o2.stringFromCodePoint)(i4) : "", t4 >> 22, 2097152 & t4 ? this._combined[e4].charCodeAt(this._combined[e4].length - 1) : i4];
          }
          set(e4, t4) {
            this._data[3 * e4 + 1] = t4[n2.CHAR_DATA_ATTR_INDEX], t4[n2.CHAR_DATA_CHAR_INDEX].length > 1 ? (this._combined[e4] = t4[1], this._data[3 * e4 + 0] = 2097152 | e4 | t4[n2.CHAR_DATA_WIDTH_INDEX] << 22) : this._data[3 * e4 + 0] = t4[n2.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | t4[n2.CHAR_DATA_WIDTH_INDEX] << 22;
          }
          getWidth(e4) {
            return this._data[3 * e4 + 0] >> 22;
          }
          hasWidth(e4) {
            return 12582912 & this._data[3 * e4 + 0];
          }
          getFg(e4) {
            return this._data[3 * e4 + 1];
          }
          getBg(e4) {
            return this._data[3 * e4 + 2];
          }
          hasContent(e4) {
            return 4194303 & this._data[3 * e4 + 0];
          }
          getCodePoint(e4) {
            const t4 = this._data[3 * e4 + 0];
            return 2097152 & t4 ? this._combined[e4].charCodeAt(this._combined[e4].length - 1) : 2097151 & t4;
          }
          isCombined(e4) {
            return 2097152 & this._data[3 * e4 + 0];
          }
          getString(e4) {
            const t4 = this._data[3 * e4 + 0];
            return 2097152 & t4 ? this._combined[e4] : 2097151 & t4 ? (0, o2.stringFromCodePoint)(2097151 & t4) : "";
          }
          isProtected(e4) {
            return 536870912 & this._data[3 * e4 + 2];
          }
          loadCell(e4, t4) {
            return a2 = 3 * e4, t4.content = this._data[a2 + 0], t4.fg = this._data[a2 + 1], t4.bg = this._data[a2 + 2], 2097152 & t4.content && (t4.combinedData = this._combined[e4]), 268435456 & t4.bg && (t4.extended = this._extendedAttrs[e4]), t4;
          }
          setCell(e4, t4) {
            2097152 & t4.content && (this._combined[e4] = t4.combinedData), 268435456 & t4.bg && (this._extendedAttrs[e4] = t4.extended), this._data[3 * e4 + 0] = t4.content, this._data[3 * e4 + 1] = t4.fg, this._data[3 * e4 + 2] = t4.bg;
          }
          setCellFromCodepoint(e4, t4, i4, s4) {
            268435456 & s4.bg && (this._extendedAttrs[e4] = s4.extended), this._data[3 * e4 + 0] = t4 | i4 << 22, this._data[3 * e4 + 1] = s4.fg, this._data[3 * e4 + 2] = s4.bg;
          }
          addCodepointToCell(e4, t4, i4) {
            let s4 = this._data[3 * e4 + 0];
            2097152 & s4 ? this._combined[e4] += (0, o2.stringFromCodePoint)(t4) : 2097151 & s4 ? (this._combined[e4] = (0, o2.stringFromCodePoint)(2097151 & s4) + (0, o2.stringFromCodePoint)(t4), s4 &= -2097152, s4 |= 2097152) : s4 = t4 | 1 << 22, i4 && (s4 &= -12582913, s4 |= i4 << 22), this._data[3 * e4 + 0] = s4;
          }
          insertCells(e4, t4, i4) {
            if ((e4 %= this.length) && 2 === this.getWidth(e4 - 1) && this.setCellFromCodepoint(e4 - 1, 0, 1, i4), t4 < this.length - e4) {
              const s4 = new r2.CellData();
              for (let i5 = this.length - e4 - t4 - 1; i5 >= 0; --i5) this.setCell(e4 + t4 + i5, this.loadCell(e4 + i5, s4));
              for (let s5 = 0; s5 < t4; ++s5) this.setCell(e4 + s5, i4);
            } else for (let t5 = e4; t5 < this.length; ++t5) this.setCell(t5, i4);
            2 === this.getWidth(this.length - 1) && this.setCellFromCodepoint(this.length - 1, 0, 1, i4);
          }
          deleteCells(e4, t4, i4) {
            if (e4 %= this.length, t4 < this.length - e4) {
              const s4 = new r2.CellData();
              for (let i5 = 0; i5 < this.length - e4 - t4; ++i5) this.setCell(e4 + i5, this.loadCell(e4 + t4 + i5, s4));
              for (let e5 = this.length - t4; e5 < this.length; ++e5) this.setCell(e5, i4);
            } else for (let t5 = e4; t5 < this.length; ++t5) this.setCell(t5, i4);
            e4 && 2 === this.getWidth(e4 - 1) && this.setCellFromCodepoint(e4 - 1, 0, 1, i4), 0 !== this.getWidth(e4) || this.hasContent(e4) || this.setCellFromCodepoint(e4, 0, 1, i4);
          }
          replaceCells(e4, t4, i4, s4 = false) {
            if (s4) for (e4 && 2 === this.getWidth(e4 - 1) && !this.isProtected(e4 - 1) && this.setCellFromCodepoint(e4 - 1, 0, 1, i4), t4 < this.length && 2 === this.getWidth(t4 - 1) && !this.isProtected(t4) && this.setCellFromCodepoint(t4, 0, 1, i4); e4 < t4 && e4 < this.length; ) this.isProtected(e4) || this.setCell(e4, i4), e4++;
            else for (e4 && 2 === this.getWidth(e4 - 1) && this.setCellFromCodepoint(e4 - 1, 0, 1, i4), t4 < this.length && 2 === this.getWidth(t4 - 1) && this.setCellFromCodepoint(t4, 0, 1, i4); e4 < t4 && e4 < this.length; ) this.setCell(e4++, i4);
          }
          resize(e4, t4) {
            if (e4 === this.length) return 4 * this._data.length * 2 < this._data.buffer.byteLength;
            const i4 = 3 * e4;
            if (e4 > this.length) {
              if (this._data.buffer.byteLength >= 4 * i4) this._data = new Uint32Array(this._data.buffer, 0, i4);
              else {
                const e5 = new Uint32Array(i4);
                e5.set(this._data), this._data = e5;
              }
              for (let i5 = this.length; i5 < e4; ++i5) this.setCell(i5, t4);
            } else {
              this._data = this._data.subarray(0, i4);
              const t5 = Object.keys(this._combined);
              for (let i5 = 0; i5 < t5.length; i5++) {
                const s5 = parseInt(t5[i5], 10);
                s5 >= e4 && delete this._combined[s5];
              }
              const s4 = Object.keys(this._extendedAttrs);
              for (let t6 = 0; t6 < s4.length; t6++) {
                const i5 = parseInt(s4[t6], 10);
                i5 >= e4 && delete this._extendedAttrs[i5];
              }
            }
            return this.length = e4, 4 * i4 * 2 < this._data.buffer.byteLength;
          }
          cleanupMemory() {
            if (4 * this._data.length * 2 < this._data.buffer.byteLength) {
              const e4 = new Uint32Array(this._data.length);
              return e4.set(this._data), this._data = e4, 1;
            }
            return 0;
          }
          fill(e4, t4 = false) {
            if (t4) for (let t5 = 0; t5 < this.length; ++t5) this.isProtected(t5) || this.setCell(t5, e4);
            else {
              this._combined = {}, this._extendedAttrs = {};
              for (let t5 = 0; t5 < this.length; ++t5) this.setCell(t5, e4);
            }
          }
          copyFrom(e4) {
            this.length !== e4.length ? this._data = new Uint32Array(e4._data) : this._data.set(e4._data), this.length = e4.length, this._combined = {};
            for (const t4 in e4._combined) this._combined[t4] = e4._combined[t4];
            this._extendedAttrs = {};
            for (const t4 in e4._extendedAttrs) this._extendedAttrs[t4] = e4._extendedAttrs[t4];
            this.isWrapped = e4.isWrapped;
          }
          clone() {
            const e4 = new h2(0);
            e4._data = new Uint32Array(this._data), e4.length = this.length;
            for (const t4 in this._combined) e4._combined[t4] = this._combined[t4];
            for (const t4 in this._extendedAttrs) e4._extendedAttrs[t4] = this._extendedAttrs[t4];
            return e4.isWrapped = this.isWrapped, e4;
          }
          getTrimmedLength() {
            for (let e4 = this.length - 1; e4 >= 0; --e4) if (4194303 & this._data[3 * e4 + 0]) return e4 + (this._data[3 * e4 + 0] >> 22);
            return 0;
          }
          getNoBgTrimmedLength() {
            for (let e4 = this.length - 1; e4 >= 0; --e4) if (4194303 & this._data[3 * e4 + 0] || 50331648 & this._data[3 * e4 + 2]) return e4 + (this._data[3 * e4 + 0] >> 22);
            return 0;
          }
          copyCellsFrom(e4, t4, i4, s4, r3) {
            const n3 = e4._data;
            if (r3) for (let r4 = s4 - 1; r4 >= 0; r4--) {
              for (let e5 = 0; e5 < 3; e5++) this._data[3 * (i4 + r4) + e5] = n3[3 * (t4 + r4) + e5];
              268435456 & n3[3 * (t4 + r4) + 2] && (this._extendedAttrs[i4 + r4] = e4._extendedAttrs[t4 + r4]);
            }
            else for (let r4 = 0; r4 < s4; r4++) {
              for (let e5 = 0; e5 < 3; e5++) this._data[3 * (i4 + r4) + e5] = n3[3 * (t4 + r4) + e5];
              268435456 & n3[3 * (t4 + r4) + 2] && (this._extendedAttrs[i4 + r4] = e4._extendedAttrs[t4 + r4]);
            }
            const o3 = Object.keys(e4._combined);
            for (let s5 = 0; s5 < o3.length; s5++) {
              const r4 = parseInt(o3[s5], 10);
              r4 >= t4 && (this._combined[r4 - t4 + i4] = e4._combined[r4]);
            }
          }
          translateToString(e4, t4, i4, s4) {
            t4 = t4 ?? 0, i4 = i4 ?? this.length, e4 && (i4 = Math.min(i4, this.getTrimmedLength())), s4 && (s4.length = 0);
            let r3 = "";
            for (; t4 < i4; ) {
              const e5 = this._data[3 * t4 + 0], i5 = 2097151 & e5, a3 = 2097152 & e5 ? this._combined[t4] : i5 ? (0, o2.stringFromCodePoint)(i5) : n2.WHITESPACE_CELL_CHAR;
              if (r3 += a3, s4) for (let e6 = 0; e6 < a3.length; ++e6) s4.push(t4);
              t4 += e5 >> 22 || 1;
            }
            return s4 && s4.push(t4), r3;
          }
        }
        t3.BufferLine = h2;
      }, 4841: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.getRangeLength = void 0, t3.getRangeLength = function(e4, t4) {
          if (e4.start.y > e4.end.y) throw new Error(`Buffer range end (${e4.end.x}, ${e4.end.y}) cannot be before start (${e4.start.x}, ${e4.start.y})`);
          return t4 * (e4.end.y - e4.start.y) + (e4.end.x - e4.start.x + 1);
        };
      }, 4634: (e3, t3) => {
        function i3(e4, t4, i4) {
          if (t4 === e4.length - 1) return e4[t4].getTrimmedLength();
          const s3 = !e4[t4].hasContent(i4 - 1) && 1 === e4[t4].getWidth(i4 - 1), r2 = 2 === e4[t4 + 1].getWidth(0);
          return s3 && r2 ? i4 - 1 : i4;
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.getWrappedLineTrimmedLength = t3.reflowSmallerGetNewLineLengths = t3.reflowLargerApplyNewLayout = t3.reflowLargerCreateNewLayout = t3.reflowLargerGetLinesToRemove = void 0, t3.reflowLargerGetLinesToRemove = function(e4, t4, s3, r2, n2) {
          const o2 = [];
          for (let a2 = 0; a2 < e4.length - 1; a2++) {
            let h2 = a2, c2 = e4.get(++h2);
            if (!c2.isWrapped) continue;
            const l2 = [e4.get(a2)];
            for (; h2 < e4.length && c2.isWrapped; ) l2.push(c2), c2 = e4.get(++h2);
            if (r2 >= a2 && r2 < h2) {
              a2 += l2.length - 1;
              continue;
            }
            let d2 = 0, _2 = i3(l2, d2, t4), u2 = 1, f2 = 0;
            for (; u2 < l2.length; ) {
              const e5 = i3(l2, u2, t4), r3 = e5 - f2, o3 = s3 - _2, a3 = Math.min(r3, o3);
              l2[d2].copyCellsFrom(l2[u2], f2, _2, a3, false), _2 += a3, _2 === s3 && (d2++, _2 = 0), f2 += a3, f2 === e5 && (u2++, f2 = 0), 0 === _2 && 0 !== d2 && 2 === l2[d2 - 1].getWidth(s3 - 1) && (l2[d2].copyCellsFrom(l2[d2 - 1], s3 - 1, _2++, 1, false), l2[d2 - 1].setCell(s3 - 1, n2));
            }
            l2[d2].replaceCells(_2, s3, n2);
            let v2 = 0;
            for (let e5 = l2.length - 1; e5 > 0 && (e5 > d2 || 0 === l2[e5].getTrimmedLength()); e5--) v2++;
            v2 > 0 && (o2.push(a2 + l2.length - v2), o2.push(v2)), a2 += l2.length - 1;
          }
          return o2;
        }, t3.reflowLargerCreateNewLayout = function(e4, t4) {
          const i4 = [];
          let s3 = 0, r2 = t4[s3], n2 = 0;
          for (let o2 = 0; o2 < e4.length; o2++) if (r2 === o2) {
            const i5 = t4[++s3];
            e4.onDeleteEmitter.fire({ index: o2 - n2, amount: i5 }), o2 += i5 - 1, n2 += i5, r2 = t4[++s3];
          } else i4.push(o2);
          return { layout: i4, countRemoved: n2 };
        }, t3.reflowLargerApplyNewLayout = function(e4, t4) {
          const i4 = [];
          for (let s3 = 0; s3 < t4.length; s3++) i4.push(e4.get(t4[s3]));
          for (let t5 = 0; t5 < i4.length; t5++) e4.set(t5, i4[t5]);
          e4.length = t4.length;
        }, t3.reflowSmallerGetNewLineLengths = function(e4, t4, s3) {
          const r2 = [], n2 = e4.map(((s4, r3) => i3(e4, r3, t4))).reduce(((e5, t5) => e5 + t5));
          let o2 = 0, a2 = 0, h2 = 0;
          for (; h2 < n2; ) {
            if (n2 - h2 < s3) {
              r2.push(n2 - h2);
              break;
            }
            o2 += s3;
            const c2 = i3(e4, a2, t4);
            o2 > c2 && (o2 -= c2, a2++);
            const l2 = 2 === e4[a2].getWidth(o2 - 1);
            l2 && o2--;
            const d2 = l2 ? s3 - 1 : s3;
            r2.push(d2), h2 += d2;
          }
          return r2;
        }, t3.getWrappedLineTrimmedLength = i3;
      }, 5295: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferSet = void 0;
        const s3 = i3(8460), r2 = i3(844), n2 = i3(9092);
        class o2 extends r2.Disposable {
          constructor(e4, t4) {
            super(), this._optionsService = e4, this._bufferService = t4, this._onBufferActivate = this.register(new s3.EventEmitter()), this.onBufferActivate = this._onBufferActivate.event, this.reset(), this.register(this._optionsService.onSpecificOptionChange("scrollback", (() => this.resize(this._bufferService.cols, this._bufferService.rows)))), this.register(this._optionsService.onSpecificOptionChange("tabStopWidth", (() => this.setupTabStops())));
          }
          reset() {
            this._normal = new n2.Buffer(true, this._optionsService, this._bufferService), this._normal.fillViewportRows(), this._alt = new n2.Buffer(false, this._optionsService, this._bufferService), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }), this.setupTabStops();
          }
          get alt() {
            return this._alt;
          }
          get active() {
            return this._activeBuffer;
          }
          get normal() {
            return this._normal;
          }
          activateNormalBuffer() {
            this._activeBuffer !== this._normal && (this._normal.x = this._alt.x, this._normal.y = this._alt.y, this._alt.clearAllMarkers(), this._alt.clear(), this._activeBuffer = this._normal, this._onBufferActivate.fire({ activeBuffer: this._normal, inactiveBuffer: this._alt }));
          }
          activateAltBuffer(e4) {
            this._activeBuffer !== this._alt && (this._alt.fillViewportRows(e4), this._alt.x = this._normal.x, this._alt.y = this._normal.y, this._activeBuffer = this._alt, this._onBufferActivate.fire({ activeBuffer: this._alt, inactiveBuffer: this._normal }));
          }
          resize(e4, t4) {
            this._normal.resize(e4, t4), this._alt.resize(e4, t4), this.setupTabStops(e4);
          }
          setupTabStops(e4) {
            this._normal.setupTabStops(e4), this._alt.setupTabStops(e4);
          }
        }
        t3.BufferSet = o2;
      }, 511: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CellData = void 0;
        const s3 = i3(482), r2 = i3(643), n2 = i3(3734);
        class o2 extends n2.AttributeData {
          constructor() {
            super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new n2.ExtendedAttrs(), this.combinedData = "";
          }
          static fromCharData(e4) {
            const t4 = new o2();
            return t4.setFromCharData(e4), t4;
          }
          isCombined() {
            return 2097152 & this.content;
          }
          getWidth() {
            return this.content >> 22;
          }
          getChars() {
            return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s3.stringFromCodePoint)(2097151 & this.content) : "";
          }
          getCode() {
            return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
          }
          setFromCharData(e4) {
            this.fg = e4[r2.CHAR_DATA_ATTR_INDEX], this.bg = 0;
            let t4 = false;
            if (e4[r2.CHAR_DATA_CHAR_INDEX].length > 2) t4 = true;
            else if (2 === e4[r2.CHAR_DATA_CHAR_INDEX].length) {
              const i4 = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
              if (55296 <= i4 && i4 <= 56319) {
                const s4 = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                56320 <= s4 && s4 <= 57343 ? this.content = 1024 * (i4 - 55296) + s4 - 56320 + 65536 | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22 : t4 = true;
              } else t4 = true;
            } else this.content = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22;
            t4 && (this.combinedData = e4[r2.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22);
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t3.CellData = o2;
      }, 643: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.WHITESPACE_CELL_CODE = t3.WHITESPACE_CELL_WIDTH = t3.WHITESPACE_CELL_CHAR = t3.NULL_CELL_CODE = t3.NULL_CELL_WIDTH = t3.NULL_CELL_CHAR = t3.CHAR_DATA_CODE_INDEX = t3.CHAR_DATA_WIDTH_INDEX = t3.CHAR_DATA_CHAR_INDEX = t3.CHAR_DATA_ATTR_INDEX = t3.DEFAULT_EXT = t3.DEFAULT_ATTR = t3.DEFAULT_COLOR = void 0, t3.DEFAULT_COLOR = 0, t3.DEFAULT_ATTR = 256 | t3.DEFAULT_COLOR << 9, t3.DEFAULT_EXT = 0, t3.CHAR_DATA_ATTR_INDEX = 0, t3.CHAR_DATA_CHAR_INDEX = 1, t3.CHAR_DATA_WIDTH_INDEX = 2, t3.CHAR_DATA_CODE_INDEX = 3, t3.NULL_CELL_CHAR = "", t3.NULL_CELL_WIDTH = 1, t3.NULL_CELL_CODE = 0, t3.WHITESPACE_CELL_CHAR = " ", t3.WHITESPACE_CELL_WIDTH = 1, t3.WHITESPACE_CELL_CODE = 32;
      }, 4863: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Marker = void 0;
        const s3 = i3(8460), r2 = i3(844);
        class n2 {
          get id() {
            return this._id;
          }
          constructor(e4) {
            this.line = e4, this.isDisposed = false, this._disposables = [], this._id = n2._nextId++, this._onDispose = this.register(new s3.EventEmitter()), this.onDispose = this._onDispose.event;
          }
          dispose() {
            this.isDisposed || (this.isDisposed = true, this.line = -1, this._onDispose.fire(), (0, r2.disposeArray)(this._disposables), this._disposables.length = 0);
          }
          register(e4) {
            return this._disposables.push(e4), e4;
          }
        }
        t3.Marker = n2, n2._nextId = 1;
      }, 7116: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DEFAULT_CHARSET = t3.CHARSETS = void 0, t3.CHARSETS = {}, t3.DEFAULT_CHARSET = t3.CHARSETS.B, t3.CHARSETS[0] = { "`": "◆", a: "▒", b: "␉", c: "␌", d: "␍", e: "␊", f: "°", g: "±", h: "␤", i: "␋", j: "┘", k: "┐", l: "┌", m: "└", n: "┼", o: "⎺", p: "⎻", q: "─", r: "⎼", s: "⎽", t: "├", u: "┤", v: "┴", w: "┬", x: "│", y: "≤", z: "≥", "{": "π", "|": "≠", "}": "£", "~": "·" }, t3.CHARSETS.A = { "#": "£" }, t3.CHARSETS.B = void 0, t3.CHARSETS[4] = { "#": "£", "@": "¾", "[": "ij", "\\": "½", "]": "|", "{": "¨", "|": "f", "}": "¼", "~": "´" }, t3.CHARSETS.C = t3.CHARSETS[5] = { "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" }, t3.CHARSETS.R = { "#": "£", "@": "à", "[": "°", "\\": "ç", "]": "§", "{": "é", "|": "ù", "}": "è", "~": "¨" }, t3.CHARSETS.Q = { "@": "à", "[": "â", "\\": "ç", "]": "ê", "^": "î", "`": "ô", "{": "é", "|": "ù", "}": "è", "~": "û" }, t3.CHARSETS.K = { "@": "§", "[": "Ä", "\\": "Ö", "]": "Ü", "{": "ä", "|": "ö", "}": "ü", "~": "ß" }, t3.CHARSETS.Y = { "#": "£", "@": "§", "[": "°", "\\": "ç", "]": "é", "`": "ù", "{": "à", "|": "ò", "}": "è", "~": "ì" }, t3.CHARSETS.E = t3.CHARSETS[6] = { "@": "Ä", "[": "Æ", "\\": "Ø", "]": "Å", "^": "Ü", "`": "ä", "{": "æ", "|": "ø", "}": "å", "~": "ü" }, t3.CHARSETS.Z = { "#": "£", "@": "§", "[": "¡", "\\": "Ñ", "]": "¿", "{": "°", "|": "ñ", "}": "ç" }, t3.CHARSETS.H = t3.CHARSETS[7] = { "@": "É", "[": "Ä", "\\": "Ö", "]": "Å", "^": "Ü", "`": "é", "{": "ä", "|": "ö", "}": "å", "~": "ü" }, t3.CHARSETS["="] = { "#": "ù", "@": "à", "[": "é", "\\": "ç", "]": "ê", "^": "î", _: "è", "`": "ô", "{": "ä", "|": "ö", "}": "ü", "~": "û" };
      }, 2584: (e3, t3) => {
        var i3, s3, r2;
        Object.defineProperty(t3, "__esModule", { value: true }), t3.C1_ESCAPED = t3.C1 = t3.C0 = void 0, (function(e4) {
          e4.NUL = "\0", e4.SOH = "", e4.STX = "", e4.ETX = "", e4.EOT = "", e4.ENQ = "", e4.ACK = "", e4.BEL = "\x07", e4.BS = "\b", e4.HT = "	", e4.LF = "\n", e4.VT = "\v", e4.FF = "\f", e4.CR = "\r", e4.SO = "", e4.SI = "", e4.DLE = "", e4.DC1 = "", e4.DC2 = "", e4.DC3 = "", e4.DC4 = "", e4.NAK = "", e4.SYN = "", e4.ETB = "", e4.CAN = "", e4.EM = "", e4.SUB = "", e4.ESC = "\x1B", e4.FS = "", e4.GS = "", e4.RS = "", e4.US = "", e4.SP = " ", e4.DEL = "";
        })(i3 || (t3.C0 = i3 = {})), (function(e4) {
          e4.PAD = "", e4.HOP = "", e4.BPH = "", e4.NBH = "", e4.IND = "", e4.NEL = "", e4.SSA = "", e4.ESA = "", e4.HTS = "", e4.HTJ = "", e4.VTS = "", e4.PLD = "", e4.PLU = "", e4.RI = "", e4.SS2 = "", e4.SS3 = "", e4.DCS = "", e4.PU1 = "", e4.PU2 = "", e4.STS = "", e4.CCH = "", e4.MW = "", e4.SPA = "", e4.EPA = "", e4.SOS = "", e4.SGCI = "", e4.SCI = "", e4.CSI = "", e4.ST = "", e4.OSC = "", e4.PM = "", e4.APC = "";
        })(s3 || (t3.C1 = s3 = {})), (function(e4) {
          e4.ST = `${i3.ESC}\\`;
        })(r2 || (t3.C1_ESCAPED = r2 = {}));
      }, 7399: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.evaluateKeyboardEvent = void 0;
        const s3 = i3(2584), r2 = { 48: ["0", ")"], 49: ["1", "!"], 50: ["2", "@"], 51: ["3", "#"], 52: ["4", "$"], 53: ["5", "%"], 54: ["6", "^"], 55: ["7", "&"], 56: ["8", "*"], 57: ["9", "("], 186: [";", ":"], 187: ["=", "+"], 188: [",", "<"], 189: ["-", "_"], 190: [".", ">"], 191: ["/", "?"], 192: ["`", "~"], 219: ["[", "{"], 220: ["\\", "|"], 221: ["]", "}"], 222: ["'", '"'] };
        t3.evaluateKeyboardEvent = function(e4, t4, i4, n2) {
          const o2 = { type: 0, cancel: false, key: void 0 }, a2 = (e4.shiftKey ? 1 : 0) | (e4.altKey ? 2 : 0) | (e4.ctrlKey ? 4 : 0) | (e4.metaKey ? 8 : 0);
          switch (e4.keyCode) {
            case 0:
              "UIKeyInputUpArrow" === e4.key ? o2.key = t4 ? s3.C0.ESC + "OA" : s3.C0.ESC + "[A" : "UIKeyInputLeftArrow" === e4.key ? o2.key = t4 ? s3.C0.ESC + "OD" : s3.C0.ESC + "[D" : "UIKeyInputRightArrow" === e4.key ? o2.key = t4 ? s3.C0.ESC + "OC" : s3.C0.ESC + "[C" : "UIKeyInputDownArrow" === e4.key && (o2.key = t4 ? s3.C0.ESC + "OB" : s3.C0.ESC + "[B");
              break;
            case 8:
              o2.key = e4.ctrlKey ? "\b" : s3.C0.DEL, e4.altKey && (o2.key = s3.C0.ESC + o2.key);
              break;
            case 9:
              if (e4.shiftKey) {
                o2.key = s3.C0.ESC + "[Z";
                break;
              }
              o2.key = s3.C0.HT, o2.cancel = true;
              break;
            case 13:
              o2.key = e4.altKey ? s3.C0.ESC + s3.C0.CR : s3.C0.CR, o2.cancel = true;
              break;
            case 27:
              o2.key = s3.C0.ESC, e4.altKey && (o2.key = s3.C0.ESC + s3.C0.ESC), o2.cancel = true;
              break;
            case 37:
              if (e4.metaKey) break;
              a2 ? (o2.key = s3.C0.ESC + "[1;" + (a2 + 1) + "D", o2.key === s3.C0.ESC + "[1;3D" && (o2.key = s3.C0.ESC + (i4 ? "b" : "[1;5D"))) : o2.key = t4 ? s3.C0.ESC + "OD" : s3.C0.ESC + "[D";
              break;
            case 39:
              if (e4.metaKey) break;
              a2 ? (o2.key = s3.C0.ESC + "[1;" + (a2 + 1) + "C", o2.key === s3.C0.ESC + "[1;3C" && (o2.key = s3.C0.ESC + (i4 ? "f" : "[1;5C"))) : o2.key = t4 ? s3.C0.ESC + "OC" : s3.C0.ESC + "[C";
              break;
            case 38:
              if (e4.metaKey) break;
              a2 ? (o2.key = s3.C0.ESC + "[1;" + (a2 + 1) + "A", i4 || o2.key !== s3.C0.ESC + "[1;3A" || (o2.key = s3.C0.ESC + "[1;5A")) : o2.key = t4 ? s3.C0.ESC + "OA" : s3.C0.ESC + "[A";
              break;
            case 40:
              if (e4.metaKey) break;
              a2 ? (o2.key = s3.C0.ESC + "[1;" + (a2 + 1) + "B", i4 || o2.key !== s3.C0.ESC + "[1;3B" || (o2.key = s3.C0.ESC + "[1;5B")) : o2.key = t4 ? s3.C0.ESC + "OB" : s3.C0.ESC + "[B";
              break;
            case 45:
              e4.shiftKey || e4.ctrlKey || (o2.key = s3.C0.ESC + "[2~");
              break;
            case 46:
              o2.key = a2 ? s3.C0.ESC + "[3;" + (a2 + 1) + "~" : s3.C0.ESC + "[3~";
              break;
            case 36:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "H" : t4 ? s3.C0.ESC + "OH" : s3.C0.ESC + "[H";
              break;
            case 35:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "F" : t4 ? s3.C0.ESC + "OF" : s3.C0.ESC + "[F";
              break;
            case 33:
              e4.shiftKey ? o2.type = 2 : e4.ctrlKey ? o2.key = s3.C0.ESC + "[5;" + (a2 + 1) + "~" : o2.key = s3.C0.ESC + "[5~";
              break;
            case 34:
              e4.shiftKey ? o2.type = 3 : e4.ctrlKey ? o2.key = s3.C0.ESC + "[6;" + (a2 + 1) + "~" : o2.key = s3.C0.ESC + "[6~";
              break;
            case 112:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "P" : s3.C0.ESC + "OP";
              break;
            case 113:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "Q" : s3.C0.ESC + "OQ";
              break;
            case 114:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "R" : s3.C0.ESC + "OR";
              break;
            case 115:
              o2.key = a2 ? s3.C0.ESC + "[1;" + (a2 + 1) + "S" : s3.C0.ESC + "OS";
              break;
            case 116:
              o2.key = a2 ? s3.C0.ESC + "[15;" + (a2 + 1) + "~" : s3.C0.ESC + "[15~";
              break;
            case 117:
              o2.key = a2 ? s3.C0.ESC + "[17;" + (a2 + 1) + "~" : s3.C0.ESC + "[17~";
              break;
            case 118:
              o2.key = a2 ? s3.C0.ESC + "[18;" + (a2 + 1) + "~" : s3.C0.ESC + "[18~";
              break;
            case 119:
              o2.key = a2 ? s3.C0.ESC + "[19;" + (a2 + 1) + "~" : s3.C0.ESC + "[19~";
              break;
            case 120:
              o2.key = a2 ? s3.C0.ESC + "[20;" + (a2 + 1) + "~" : s3.C0.ESC + "[20~";
              break;
            case 121:
              o2.key = a2 ? s3.C0.ESC + "[21;" + (a2 + 1) + "~" : s3.C0.ESC + "[21~";
              break;
            case 122:
              o2.key = a2 ? s3.C0.ESC + "[23;" + (a2 + 1) + "~" : s3.C0.ESC + "[23~";
              break;
            case 123:
              o2.key = a2 ? s3.C0.ESC + "[24;" + (a2 + 1) + "~" : s3.C0.ESC + "[24~";
              break;
            default:
              if (!e4.ctrlKey || e4.shiftKey || e4.altKey || e4.metaKey) if (i4 && !n2 || !e4.altKey || e4.metaKey) !i4 || e4.altKey || e4.ctrlKey || e4.shiftKey || !e4.metaKey ? e4.key && !e4.ctrlKey && !e4.altKey && !e4.metaKey && e4.keyCode >= 48 && 1 === e4.key.length ? o2.key = e4.key : e4.key && e4.ctrlKey && ("_" === e4.key && (o2.key = s3.C0.US), "@" === e4.key && (o2.key = s3.C0.NUL)) : 65 === e4.keyCode && (o2.type = 1);
              else {
                const t5 = r2[e4.keyCode], i5 = t5?.[e4.shiftKey ? 1 : 0];
                if (i5) o2.key = s3.C0.ESC + i5;
                else if (e4.keyCode >= 65 && e4.keyCode <= 90) {
                  const t6 = e4.ctrlKey ? e4.keyCode - 64 : e4.keyCode + 32;
                  let i6 = String.fromCharCode(t6);
                  e4.shiftKey && (i6 = i6.toUpperCase()), o2.key = s3.C0.ESC + i6;
                } else if (32 === e4.keyCode) o2.key = s3.C0.ESC + (e4.ctrlKey ? s3.C0.NUL : " ");
                else if ("Dead" === e4.key && e4.code.startsWith("Key")) {
                  let t6 = e4.code.slice(3, 4);
                  e4.shiftKey || (t6 = t6.toLowerCase()), o2.key = s3.C0.ESC + t6, o2.cancel = true;
                }
              }
              else e4.keyCode >= 65 && e4.keyCode <= 90 ? o2.key = String.fromCharCode(e4.keyCode - 64) : 32 === e4.keyCode ? o2.key = s3.C0.NUL : e4.keyCode >= 51 && e4.keyCode <= 55 ? o2.key = String.fromCharCode(e4.keyCode - 51 + 27) : 56 === e4.keyCode ? o2.key = s3.C0.DEL : 219 === e4.keyCode ? o2.key = s3.C0.ESC : 220 === e4.keyCode ? o2.key = s3.C0.FS : 221 === e4.keyCode && (o2.key = s3.C0.GS);
          }
          return o2;
        };
      }, 482: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Utf8ToUtf32 = t3.StringToUtf32 = t3.utf32ToString = t3.stringFromCodePoint = void 0, t3.stringFromCodePoint = function(e4) {
          return e4 > 65535 ? (e4 -= 65536, String.fromCharCode(55296 + (e4 >> 10)) + String.fromCharCode(e4 % 1024 + 56320)) : String.fromCharCode(e4);
        }, t3.utf32ToString = function(e4, t4 = 0, i3 = e4.length) {
          let s3 = "";
          for (let r2 = t4; r2 < i3; ++r2) {
            let t5 = e4[r2];
            t5 > 65535 ? (t5 -= 65536, s3 += String.fromCharCode(55296 + (t5 >> 10)) + String.fromCharCode(t5 % 1024 + 56320)) : s3 += String.fromCharCode(t5);
          }
          return s3;
        }, t3.StringToUtf32 = class {
          constructor() {
            this._interim = 0;
          }
          clear() {
            this._interim = 0;
          }
          decode(e4, t4) {
            const i3 = e4.length;
            if (!i3) return 0;
            let s3 = 0, r2 = 0;
            if (this._interim) {
              const i4 = e4.charCodeAt(r2++);
              56320 <= i4 && i4 <= 57343 ? t4[s3++] = 1024 * (this._interim - 55296) + i4 - 56320 + 65536 : (t4[s3++] = this._interim, t4[s3++] = i4), this._interim = 0;
            }
            for (let n2 = r2; n2 < i3; ++n2) {
              const r3 = e4.charCodeAt(n2);
              if (55296 <= r3 && r3 <= 56319) {
                if (++n2 >= i3) return this._interim = r3, s3;
                const o2 = e4.charCodeAt(n2);
                56320 <= o2 && o2 <= 57343 ? t4[s3++] = 1024 * (r3 - 55296) + o2 - 56320 + 65536 : (t4[s3++] = r3, t4[s3++] = o2);
              } else 65279 !== r3 && (t4[s3++] = r3);
            }
            return s3;
          }
        }, t3.Utf8ToUtf32 = class {
          constructor() {
            this.interim = new Uint8Array(3);
          }
          clear() {
            this.interim.fill(0);
          }
          decode(e4, t4) {
            const i3 = e4.length;
            if (!i3) return 0;
            let s3, r2, n2, o2, a2 = 0, h2 = 0, c2 = 0;
            if (this.interim[0]) {
              let s4 = false, r3 = this.interim[0];
              r3 &= 192 == (224 & r3) ? 31 : 224 == (240 & r3) ? 15 : 7;
              let n3, o3 = 0;
              for (; (n3 = 63 & this.interim[++o3]) && o3 < 4; ) r3 <<= 6, r3 |= n3;
              const h3 = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, l3 = h3 - o3;
              for (; c2 < l3; ) {
                if (c2 >= i3) return 0;
                if (n3 = e4[c2++], 128 != (192 & n3)) {
                  c2--, s4 = true;
                  break;
                }
                this.interim[o3++] = n3, r3 <<= 6, r3 |= 63 & n3;
              }
              s4 || (2 === h3 ? r3 < 128 ? c2-- : t4[a2++] = r3 : 3 === h3 ? r3 < 2048 || r3 >= 55296 && r3 <= 57343 || 65279 === r3 || (t4[a2++] = r3) : r3 < 65536 || r3 > 1114111 || (t4[a2++] = r3)), this.interim.fill(0);
            }
            const l2 = i3 - 4;
            let d2 = c2;
            for (; d2 < i3; ) {
              for (; !(!(d2 < l2) || 128 & (s3 = e4[d2]) || 128 & (r2 = e4[d2 + 1]) || 128 & (n2 = e4[d2 + 2]) || 128 & (o2 = e4[d2 + 3])); ) t4[a2++] = s3, t4[a2++] = r2, t4[a2++] = n2, t4[a2++] = o2, d2 += 4;
              if (s3 = e4[d2++], s3 < 128) t4[a2++] = s3;
              else if (192 == (224 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (h2 = (31 & s3) << 6 | 63 & r2, h2 < 128) {
                  d2--;
                  continue;
                }
                t4[a2++] = h2;
              } else if (224 == (240 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, a2;
                if (n2 = e4[d2++], 128 != (192 & n2)) {
                  d2--;
                  continue;
                }
                if (h2 = (15 & s3) << 12 | (63 & r2) << 6 | 63 & n2, h2 < 2048 || h2 >= 55296 && h2 <= 57343 || 65279 === h2) continue;
                t4[a2++] = h2;
              } else if (240 == (248 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, a2;
                if (n2 = e4[d2++], 128 != (192 & n2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, this.interim[2] = n2, a2;
                if (o2 = e4[d2++], 128 != (192 & o2)) {
                  d2--;
                  continue;
                }
                if (h2 = (7 & s3) << 18 | (63 & r2) << 12 | (63 & n2) << 6 | 63 & o2, h2 < 65536 || h2 > 1114111) continue;
                t4[a2++] = h2;
              }
            }
            return a2;
          }
        };
      }, 225: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeV6 = void 0;
        const s3 = i3(1480), r2 = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], n2 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
        let o2;
        t3.UnicodeV6 = class {
          constructor() {
            if (this.version = "6", !o2) {
              o2 = new Uint8Array(65536), o2.fill(1), o2[0] = 0, o2.fill(0, 1, 32), o2.fill(0, 127, 160), o2.fill(2, 4352, 4448), o2[9001] = 2, o2[9002] = 2, o2.fill(2, 11904, 42192), o2[12351] = 1, o2.fill(2, 44032, 55204), o2.fill(2, 63744, 64256), o2.fill(2, 65040, 65050), o2.fill(2, 65072, 65136), o2.fill(2, 65280, 65377), o2.fill(2, 65504, 65511);
              for (let e4 = 0; e4 < r2.length; ++e4) o2.fill(0, r2[e4][0], r2[e4][1] + 1);
            }
          }
          wcwidth(e4) {
            return e4 < 32 ? 0 : e4 < 127 ? 1 : e4 < 65536 ? o2[e4] : (function(e5, t4) {
              let i4, s4 = 0, r3 = t4.length - 1;
              if (e5 < t4[0][0] || e5 > t4[r3][1]) return false;
              for (; r3 >= s4; ) if (i4 = s4 + r3 >> 1, e5 > t4[i4][1]) s4 = i4 + 1;
              else {
                if (!(e5 < t4[i4][0])) return true;
                r3 = i4 - 1;
              }
              return false;
            })(e4, n2) ? 0 : e4 >= 131072 && e4 <= 196605 || e4 >= 196608 && e4 <= 262141 ? 2 : 1;
          }
          charProperties(e4, t4) {
            let i4 = this.wcwidth(e4), r3 = 0 === i4 && 0 !== t4;
            if (r3) {
              const e5 = s3.UnicodeService.extractWidth(t4);
              0 === e5 ? r3 = false : e5 > i4 && (i4 = e5);
            }
            return s3.UnicodeService.createPropertyValue(0, i4, r3);
          }
        };
      }, 5981: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.WriteBuffer = void 0;
        const s3 = i3(8460), r2 = i3(844);
        class n2 extends r2.Disposable {
          constructor(e4) {
            super(), this._action = e4, this._writeBuffer = [], this._callbacks = [], this._pendingData = 0, this._bufferOffset = 0, this._isSyncWriting = false, this._syncCalls = 0, this._didUserInput = false, this._onWriteParsed = this.register(new s3.EventEmitter()), this.onWriteParsed = this._onWriteParsed.event;
          }
          handleUserInput() {
            this._didUserInput = true;
          }
          writeSync(e4, t4) {
            if (void 0 !== t4 && this._syncCalls > t4) return void (this._syncCalls = 0);
            if (this._pendingData += e4.length, this._writeBuffer.push(e4), this._callbacks.push(void 0), this._syncCalls++, this._isSyncWriting) return;
            let i4;
            for (this._isSyncWriting = true; i4 = this._writeBuffer.shift(); ) {
              this._action(i4);
              const e5 = this._callbacks.shift();
              e5 && e5();
            }
            this._pendingData = 0, this._bufferOffset = 2147483647, this._isSyncWriting = false, this._syncCalls = 0;
          }
          write(e4, t4) {
            if (this._pendingData > 5e7) throw new Error("write data discarded, use flow control to avoid losing data");
            if (!this._writeBuffer.length) {
              if (this._bufferOffset = 0, this._didUserInput) return this._didUserInput = false, this._pendingData += e4.length, this._writeBuffer.push(e4), this._callbacks.push(t4), void this._innerWrite();
              setTimeout((() => this._innerWrite()));
            }
            this._pendingData += e4.length, this._writeBuffer.push(e4), this._callbacks.push(t4);
          }
          _innerWrite(e4 = 0, t4 = true) {
            const i4 = e4 || Date.now();
            for (; this._writeBuffer.length > this._bufferOffset; ) {
              const e5 = this._writeBuffer[this._bufferOffset], s4 = this._action(e5, t4);
              if (s4) {
                const e6 = (e7) => Date.now() - i4 >= 12 ? setTimeout((() => this._innerWrite(0, e7))) : this._innerWrite(i4, e7);
                return void s4.catch(((e7) => (queueMicrotask((() => {
                  throw e7;
                })), Promise.resolve(false)))).then(e6);
              }
              const r3 = this._callbacks[this._bufferOffset];
              if (r3 && r3(), this._bufferOffset++, this._pendingData -= e5.length, Date.now() - i4 >= 12) break;
            }
            this._writeBuffer.length > this._bufferOffset ? (this._bufferOffset > 50 && (this._writeBuffer = this._writeBuffer.slice(this._bufferOffset), this._callbacks = this._callbacks.slice(this._bufferOffset), this._bufferOffset = 0), setTimeout((() => this._innerWrite()))) : (this._writeBuffer.length = 0, this._callbacks.length = 0, this._pendingData = 0, this._bufferOffset = 0), this._onWriteParsed.fire();
          }
        }
        t3.WriteBuffer = n2;
      }, 5941: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.toRgbString = t3.parseColor = void 0;
        const i3 = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/, s3 = /^[\da-f]+$/;
        function r2(e4, t4) {
          const i4 = e4.toString(16), s4 = i4.length < 2 ? "0" + i4 : i4;
          switch (t4) {
            case 4:
              return i4[0];
            case 8:
              return s4;
            case 12:
              return (s4 + s4).slice(0, 3);
            default:
              return s4 + s4;
          }
        }
        t3.parseColor = function(e4) {
          if (!e4) return;
          let t4 = e4.toLowerCase();
          if (0 === t4.indexOf("rgb:")) {
            t4 = t4.slice(4);
            const e5 = i3.exec(t4);
            if (e5) {
              const t5 = e5[1] ? 15 : e5[4] ? 255 : e5[7] ? 4095 : 65535;
              return [Math.round(parseInt(e5[1] || e5[4] || e5[7] || e5[10], 16) / t5 * 255), Math.round(parseInt(e5[2] || e5[5] || e5[8] || e5[11], 16) / t5 * 255), Math.round(parseInt(e5[3] || e5[6] || e5[9] || e5[12], 16) / t5 * 255)];
            }
          } else if (0 === t4.indexOf("#") && (t4 = t4.slice(1), s3.exec(t4) && [3, 6, 9, 12].includes(t4.length))) {
            const e5 = t4.length / 3, i4 = [0, 0, 0];
            for (let s4 = 0; s4 < 3; ++s4) {
              const r3 = parseInt(t4.slice(e5 * s4, e5 * s4 + e5), 16);
              i4[s4] = 1 === e5 ? r3 << 4 : 2 === e5 ? r3 : 3 === e5 ? r3 >> 4 : r3 >> 8;
            }
            return i4;
          }
        }, t3.toRgbString = function(e4, t4 = 16) {
          const [i4, s4, n2] = e4;
          return `rgb:${r2(i4, t4)}/${r2(s4, t4)}/${r2(n2, t4)}`;
        };
      }, 5770: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.PAYLOAD_LIMIT = void 0, t3.PAYLOAD_LIMIT = 1e7;
      }, 6351: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DcsHandler = t3.DcsParser = void 0;
        const s3 = i3(482), r2 = i3(8742), n2 = i3(5770), o2 = [];
        t3.DcsParser = class {
          constructor() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._active = o2, this._ident = 0, this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = o2;
          }
          registerHandler(e4, t4) {
            void 0 === this._handlers[e4] && (this._handlers[e4] = []);
            const i4 = this._handlers[e4];
            return i4.push(t4), { dispose: () => {
              const e5 = i4.indexOf(t4);
              -1 !== e5 && i4.splice(e5, 1);
            } };
          }
          clearHandler(e4) {
            this._handlers[e4] && delete this._handlers[e4];
          }
          setHandlerFallback(e4) {
            this._handlerFb = e4;
          }
          reset() {
            if (this._active.length) for (let e4 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e4 >= 0; --e4) this._active[e4].unhook(false);
            this._stack.paused = false, this._active = o2, this._ident = 0;
          }
          hook(e4, t4) {
            if (this.reset(), this._ident = e4, this._active = this._handlers[e4] || o2, this._active.length) for (let e5 = this._active.length - 1; e5 >= 0; e5--) this._active[e5].hook(t4);
            else this._handlerFb(this._ident, "HOOK", t4);
          }
          put(e4, t4, i4) {
            if (this._active.length) for (let s4 = this._active.length - 1; s4 >= 0; s4--) this._active[s4].put(e4, t4, i4);
            else this._handlerFb(this._ident, "PUT", (0, s3.utf32ToString)(e4, t4, i4));
          }
          unhook(e4, t4 = true) {
            if (this._active.length) {
              let i4 = false, s4 = this._active.length - 1, r3 = false;
              if (this._stack.paused && (s4 = this._stack.loopPosition - 1, i4 = t4, r3 = this._stack.fallThrough, this._stack.paused = false), !r3 && false === i4) {
                for (; s4 >= 0 && (i4 = this._active[s4].unhook(e4), true !== i4); s4--) if (i4 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s4, this._stack.fallThrough = false, i4;
                s4--;
              }
              for (; s4 >= 0; s4--) if (i4 = this._active[s4].unhook(false), i4 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s4, this._stack.fallThrough = true, i4;
            } else this._handlerFb(this._ident, "UNHOOK", e4);
            this._active = o2, this._ident = 0;
          }
        };
        const a2 = new r2.Params();
        a2.addParam(0), t3.DcsHandler = class {
          constructor(e4) {
            this._handler = e4, this._data = "", this._params = a2, this._hitLimit = false;
          }
          hook(e4) {
            this._params = e4.length > 1 || e4.params[0] ? e4.clone() : a2, this._data = "", this._hitLimit = false;
          }
          put(e4, t4, i4) {
            this._hitLimit || (this._data += (0, s3.utf32ToString)(e4, t4, i4), this._data.length > n2.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          unhook(e4) {
            let t4 = false;
            if (this._hitLimit) t4 = false;
            else if (e4 && (t4 = this._handler(this._data, this._params), t4 instanceof Promise)) return t4.then(((e5) => (this._params = a2, this._data = "", this._hitLimit = false, e5)));
            return this._params = a2, this._data = "", this._hitLimit = false, t4;
          }
        };
      }, 2015: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.EscapeSequenceParser = t3.VT500_TRANSITION_TABLE = t3.TransitionTable = void 0;
        const s3 = i3(844), r2 = i3(8742), n2 = i3(6242), o2 = i3(6351);
        class a2 {
          constructor(e4) {
            this.table = new Uint8Array(e4);
          }
          setDefault(e4, t4) {
            this.table.fill(e4 << 4 | t4);
          }
          add(e4, t4, i4, s4) {
            this.table[t4 << 8 | e4] = i4 << 4 | s4;
          }
          addMany(e4, t4, i4, s4) {
            for (let r3 = 0; r3 < e4.length; r3++) this.table[t4 << 8 | e4[r3]] = i4 << 4 | s4;
          }
        }
        t3.TransitionTable = a2;
        const h2 = 160;
        t3.VT500_TRANSITION_TABLE = (function() {
          const e4 = new a2(4095), t4 = Array.apply(null, Array(256)).map(((e5, t5) => t5)), i4 = (e5, i5) => t4.slice(e5, i5), s4 = i4(32, 127), r3 = i4(0, 24);
          r3.push(25), r3.push.apply(r3, i4(28, 32));
          const n3 = i4(0, 14);
          let o3;
          for (o3 in e4.setDefault(1, 0), e4.addMany(s4, 0, 2, 0), n3) e4.addMany([24, 26, 153, 154], o3, 3, 0), e4.addMany(i4(128, 144), o3, 3, 0), e4.addMany(i4(144, 152), o3, 3, 0), e4.add(156, o3, 0, 0), e4.add(27, o3, 11, 1), e4.add(157, o3, 4, 8), e4.addMany([152, 158, 159], o3, 0, 7), e4.add(155, o3, 11, 3), e4.add(144, o3, 11, 9);
          return e4.addMany(r3, 0, 3, 0), e4.addMany(r3, 1, 3, 1), e4.add(127, 1, 0, 1), e4.addMany(r3, 8, 0, 8), e4.addMany(r3, 3, 3, 3), e4.add(127, 3, 0, 3), e4.addMany(r3, 4, 3, 4), e4.add(127, 4, 0, 4), e4.addMany(r3, 6, 3, 6), e4.addMany(r3, 5, 3, 5), e4.add(127, 5, 0, 5), e4.addMany(r3, 2, 3, 2), e4.add(127, 2, 0, 2), e4.add(93, 1, 4, 8), e4.addMany(s4, 8, 5, 8), e4.add(127, 8, 5, 8), e4.addMany([156, 27, 24, 26, 7], 8, 6, 0), e4.addMany(i4(28, 32), 8, 0, 8), e4.addMany([88, 94, 95], 1, 0, 7), e4.addMany(s4, 7, 0, 7), e4.addMany(r3, 7, 0, 7), e4.add(156, 7, 0, 0), e4.add(127, 7, 0, 7), e4.add(91, 1, 11, 3), e4.addMany(i4(64, 127), 3, 7, 0), e4.addMany(i4(48, 60), 3, 8, 4), e4.addMany([60, 61, 62, 63], 3, 9, 4), e4.addMany(i4(48, 60), 4, 8, 4), e4.addMany(i4(64, 127), 4, 7, 0), e4.addMany([60, 61, 62, 63], 4, 0, 6), e4.addMany(i4(32, 64), 6, 0, 6), e4.add(127, 6, 0, 6), e4.addMany(i4(64, 127), 6, 0, 0), e4.addMany(i4(32, 48), 3, 9, 5), e4.addMany(i4(32, 48), 5, 9, 5), e4.addMany(i4(48, 64), 5, 0, 6), e4.addMany(i4(64, 127), 5, 7, 0), e4.addMany(i4(32, 48), 4, 9, 5), e4.addMany(i4(32, 48), 1, 9, 2), e4.addMany(i4(32, 48), 2, 9, 2), e4.addMany(i4(48, 127), 2, 10, 0), e4.addMany(i4(48, 80), 1, 10, 0), e4.addMany(i4(81, 88), 1, 10, 0), e4.addMany([89, 90, 92], 1, 10, 0), e4.addMany(i4(96, 127), 1, 10, 0), e4.add(80, 1, 11, 9), e4.addMany(r3, 9, 0, 9), e4.add(127, 9, 0, 9), e4.addMany(i4(28, 32), 9, 0, 9), e4.addMany(i4(32, 48), 9, 9, 12), e4.addMany(i4(48, 60), 9, 8, 10), e4.addMany([60, 61, 62, 63], 9, 9, 10), e4.addMany(r3, 11, 0, 11), e4.addMany(i4(32, 128), 11, 0, 11), e4.addMany(i4(28, 32), 11, 0, 11), e4.addMany(r3, 10, 0, 10), e4.add(127, 10, 0, 10), e4.addMany(i4(28, 32), 10, 0, 10), e4.addMany(i4(48, 60), 10, 8, 10), e4.addMany([60, 61, 62, 63], 10, 0, 11), e4.addMany(i4(32, 48), 10, 9, 12), e4.addMany(r3, 12, 0, 12), e4.add(127, 12, 0, 12), e4.addMany(i4(28, 32), 12, 0, 12), e4.addMany(i4(32, 48), 12, 9, 12), e4.addMany(i4(48, 64), 12, 0, 11), e4.addMany(i4(64, 127), 12, 12, 13), e4.addMany(i4(64, 127), 10, 12, 13), e4.addMany(i4(64, 127), 9, 12, 13), e4.addMany(r3, 13, 13, 13), e4.addMany(s4, 13, 13, 13), e4.add(127, 13, 0, 13), e4.addMany([27, 156, 24, 26], 13, 14, 0), e4.add(h2, 0, 2, 0), e4.add(h2, 8, 5, 8), e4.add(h2, 6, 0, 6), e4.add(h2, 11, 0, 11), e4.add(h2, 13, 13, 13), e4;
        })();
        class c2 extends s3.Disposable {
          constructor(e4 = t3.VT500_TRANSITION_TABLE) {
            super(), this._transitions = e4, this._parseStack = { state: 0, handlers: [], handlerPos: 0, transition: 0, chunkPos: 0 }, this.initialState = 0, this.currentState = this.initialState, this._params = new r2.Params(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, this._printHandlerFb = (e5, t4, i4) => {
            }, this._executeHandlerFb = (e5) => {
            }, this._csiHandlerFb = (e5, t4) => {
            }, this._escHandlerFb = (e5) => {
            }, this._errorHandlerFb = (e5) => e5, this._printHandler = this._printHandlerFb, this._executeHandlers = /* @__PURE__ */ Object.create(null), this._csiHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null), this.register((0, s3.toDisposable)((() => {
              this._csiHandlers = /* @__PURE__ */ Object.create(null), this._executeHandlers = /* @__PURE__ */ Object.create(null), this._escHandlers = /* @__PURE__ */ Object.create(null);
            }))), this._oscParser = this.register(new n2.OscParser()), this._dcsParser = this.register(new o2.DcsParser()), this._errorHandler = this._errorHandlerFb, this.registerEscHandler({ final: "\\" }, (() => true));
          }
          _identifier(e4, t4 = [64, 126]) {
            let i4 = 0;
            if (e4.prefix) {
              if (e4.prefix.length > 1) throw new Error("only one byte as prefix supported");
              if (i4 = e4.prefix.charCodeAt(0), i4 && 60 > i4 || i4 > 63) throw new Error("prefix must be in range 0x3c .. 0x3f");
            }
            if (e4.intermediates) {
              if (e4.intermediates.length > 2) throw new Error("only two bytes as intermediates are supported");
              for (let t5 = 0; t5 < e4.intermediates.length; ++t5) {
                const s5 = e4.intermediates.charCodeAt(t5);
                if (32 > s5 || s5 > 47) throw new Error("intermediate must be in range 0x20 .. 0x2f");
                i4 <<= 8, i4 |= s5;
              }
            }
            if (1 !== e4.final.length) throw new Error("final must be a single byte");
            const s4 = e4.final.charCodeAt(0);
            if (t4[0] > s4 || s4 > t4[1]) throw new Error(`final must be in range ${t4[0]} .. ${t4[1]}`);
            return i4 <<= 8, i4 |= s4, i4;
          }
          identToString(e4) {
            const t4 = [];
            for (; e4; ) t4.push(String.fromCharCode(255 & e4)), e4 >>= 8;
            return t4.reverse().join("");
          }
          setPrintHandler(e4) {
            this._printHandler = e4;
          }
          clearPrintHandler() {
            this._printHandler = this._printHandlerFb;
          }
          registerEscHandler(e4, t4) {
            const i4 = this._identifier(e4, [48, 126]);
            void 0 === this._escHandlers[i4] && (this._escHandlers[i4] = []);
            const s4 = this._escHandlers[i4];
            return s4.push(t4), { dispose: () => {
              const e5 = s4.indexOf(t4);
              -1 !== e5 && s4.splice(e5, 1);
            } };
          }
          clearEscHandler(e4) {
            this._escHandlers[this._identifier(e4, [48, 126])] && delete this._escHandlers[this._identifier(e4, [48, 126])];
          }
          setEscHandlerFallback(e4) {
            this._escHandlerFb = e4;
          }
          setExecuteHandler(e4, t4) {
            this._executeHandlers[e4.charCodeAt(0)] = t4;
          }
          clearExecuteHandler(e4) {
            this._executeHandlers[e4.charCodeAt(0)] && delete this._executeHandlers[e4.charCodeAt(0)];
          }
          setExecuteHandlerFallback(e4) {
            this._executeHandlerFb = e4;
          }
          registerCsiHandler(e4, t4) {
            const i4 = this._identifier(e4);
            void 0 === this._csiHandlers[i4] && (this._csiHandlers[i4] = []);
            const s4 = this._csiHandlers[i4];
            return s4.push(t4), { dispose: () => {
              const e5 = s4.indexOf(t4);
              -1 !== e5 && s4.splice(e5, 1);
            } };
          }
          clearCsiHandler(e4) {
            this._csiHandlers[this._identifier(e4)] && delete this._csiHandlers[this._identifier(e4)];
          }
          setCsiHandlerFallback(e4) {
            this._csiHandlerFb = e4;
          }
          registerDcsHandler(e4, t4) {
            return this._dcsParser.registerHandler(this._identifier(e4), t4);
          }
          clearDcsHandler(e4) {
            this._dcsParser.clearHandler(this._identifier(e4));
          }
          setDcsHandlerFallback(e4) {
            this._dcsParser.setHandlerFallback(e4);
          }
          registerOscHandler(e4, t4) {
            return this._oscParser.registerHandler(e4, t4);
          }
          clearOscHandler(e4) {
            this._oscParser.clearHandler(e4);
          }
          setOscHandlerFallback(e4) {
            this._oscParser.setHandlerFallback(e4);
          }
          setErrorHandler(e4) {
            this._errorHandler = e4;
          }
          clearErrorHandler() {
            this._errorHandler = this._errorHandlerFb;
          }
          reset() {
            this.currentState = this.initialState, this._oscParser.reset(), this._dcsParser.reset(), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0, 0 !== this._parseStack.state && (this._parseStack.state = 2, this._parseStack.handlers = []);
          }
          _preserveStack(e4, t4, i4, s4, r3) {
            this._parseStack.state = e4, this._parseStack.handlers = t4, this._parseStack.handlerPos = i4, this._parseStack.transition = s4, this._parseStack.chunkPos = r3;
          }
          parse(e4, t4, i4) {
            let s4, r3 = 0, n3 = 0, o3 = 0;
            if (this._parseStack.state) if (2 === this._parseStack.state) this._parseStack.state = 0, o3 = this._parseStack.chunkPos + 1;
            else {
              if (void 0 === i4 || 1 === this._parseStack.state) throw this._parseStack.state = 1, new Error("improper continuation due to previous async handler, giving up parsing");
              const t5 = this._parseStack.handlers;
              let n4 = this._parseStack.handlerPos - 1;
              switch (this._parseStack.state) {
                case 3:
                  if (false === i4 && n4 > -1) {
                    for (; n4 >= 0 && (s4 = t5[n4](this._params), true !== s4); n4--) if (s4 instanceof Promise) return this._parseStack.handlerPos = n4, s4;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 4:
                  if (false === i4 && n4 > -1) {
                    for (; n4 >= 0 && (s4 = t5[n4](), true !== s4); n4--) if (s4 instanceof Promise) return this._parseStack.handlerPos = n4, s4;
                  }
                  this._parseStack.handlers = [];
                  break;
                case 6:
                  if (r3 = e4[this._parseStack.chunkPos], s4 = this._dcsParser.unhook(24 !== r3 && 26 !== r3, i4), s4) return s4;
                  27 === r3 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 5:
                  if (r3 = e4[this._parseStack.chunkPos], s4 = this._oscParser.end(24 !== r3 && 26 !== r3, i4), s4) return s4;
                  27 === r3 && (this._parseStack.transition |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0;
              }
              this._parseStack.state = 0, o3 = this._parseStack.chunkPos + 1, this.precedingJoinState = 0, this.currentState = 15 & this._parseStack.transition;
            }
            for (let i5 = o3; i5 < t4; ++i5) {
              switch (r3 = e4[i5], n3 = this._transitions.table[this.currentState << 8 | (r3 < 160 ? r3 : h2)], n3 >> 4) {
                case 2:
                  for (let s5 = i5 + 1; ; ++s5) {
                    if (s5 >= t4 || (r3 = e4[s5]) < 32 || r3 > 126 && r3 < h2) {
                      this._printHandler(e4, i5, s5), i5 = s5 - 1;
                      break;
                    }
                    if (++s5 >= t4 || (r3 = e4[s5]) < 32 || r3 > 126 && r3 < h2) {
                      this._printHandler(e4, i5, s5), i5 = s5 - 1;
                      break;
                    }
                    if (++s5 >= t4 || (r3 = e4[s5]) < 32 || r3 > 126 && r3 < h2) {
                      this._printHandler(e4, i5, s5), i5 = s5 - 1;
                      break;
                    }
                    if (++s5 >= t4 || (r3 = e4[s5]) < 32 || r3 > 126 && r3 < h2) {
                      this._printHandler(e4, i5, s5), i5 = s5 - 1;
                      break;
                    }
                  }
                  break;
                case 3:
                  this._executeHandlers[r3] ? this._executeHandlers[r3]() : this._executeHandlerFb(r3), this.precedingJoinState = 0;
                  break;
                case 0:
                  break;
                case 1:
                  if (this._errorHandler({ position: i5, code: r3, currentState: this.currentState, collect: this._collect, params: this._params, abort: false }).abort) return;
                  break;
                case 7:
                  const o4 = this._csiHandlers[this._collect << 8 | r3];
                  let a3 = o4 ? o4.length - 1 : -1;
                  for (; a3 >= 0 && (s4 = o4[a3](this._params), true !== s4); a3--) if (s4 instanceof Promise) return this._preserveStack(3, o4, a3, n3, i5), s4;
                  a3 < 0 && this._csiHandlerFb(this._collect << 8 | r3, this._params), this.precedingJoinState = 0;
                  break;
                case 8:
                  do {
                    switch (r3) {
                      case 59:
                        this._params.addParam(0);
                        break;
                      case 58:
                        this._params.addSubParam(-1);
                        break;
                      default:
                        this._params.addDigit(r3 - 48);
                    }
                  } while (++i5 < t4 && (r3 = e4[i5]) > 47 && r3 < 60);
                  i5--;
                  break;
                case 9:
                  this._collect <<= 8, this._collect |= r3;
                  break;
                case 10:
                  const c3 = this._escHandlers[this._collect << 8 | r3];
                  let l2 = c3 ? c3.length - 1 : -1;
                  for (; l2 >= 0 && (s4 = c3[l2](), true !== s4); l2--) if (s4 instanceof Promise) return this._preserveStack(4, c3, l2, n3, i5), s4;
                  l2 < 0 && this._escHandlerFb(this._collect << 8 | r3), this.precedingJoinState = 0;
                  break;
                case 11:
                  this._params.reset(), this._params.addParam(0), this._collect = 0;
                  break;
                case 12:
                  this._dcsParser.hook(this._collect << 8 | r3, this._params);
                  break;
                case 13:
                  for (let s5 = i5 + 1; ; ++s5) if (s5 >= t4 || 24 === (r3 = e4[s5]) || 26 === r3 || 27 === r3 || r3 > 127 && r3 < h2) {
                    this._dcsParser.put(e4, i5, s5), i5 = s5 - 1;
                    break;
                  }
                  break;
                case 14:
                  if (s4 = this._dcsParser.unhook(24 !== r3 && 26 !== r3), s4) return this._preserveStack(6, [], 0, n3, i5), s4;
                  27 === r3 && (n3 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
                  break;
                case 4:
                  this._oscParser.start();
                  break;
                case 5:
                  for (let s5 = i5 + 1; ; s5++) if (s5 >= t4 || (r3 = e4[s5]) < 32 || r3 > 127 && r3 < h2) {
                    this._oscParser.put(e4, i5, s5), i5 = s5 - 1;
                    break;
                  }
                  break;
                case 6:
                  if (s4 = this._oscParser.end(24 !== r3 && 26 !== r3), s4) return this._preserveStack(5, [], 0, n3, i5), s4;
                  27 === r3 && (n3 |= 1), this._params.reset(), this._params.addParam(0), this._collect = 0, this.precedingJoinState = 0;
              }
              this.currentState = 15 & n3;
            }
          }
        }
        t3.EscapeSequenceParser = c2;
      }, 6242: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.OscHandler = t3.OscParser = void 0;
        const s3 = i3(5770), r2 = i3(482), n2 = [];
        t3.OscParser = class {
          constructor() {
            this._state = 0, this._active = n2, this._id = -1, this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._stack = { paused: false, loopPosition: 0, fallThrough: false };
          }
          registerHandler(e4, t4) {
            void 0 === this._handlers[e4] && (this._handlers[e4] = []);
            const i4 = this._handlers[e4];
            return i4.push(t4), { dispose: () => {
              const e5 = i4.indexOf(t4);
              -1 !== e5 && i4.splice(e5, 1);
            } };
          }
          clearHandler(e4) {
            this._handlers[e4] && delete this._handlers[e4];
          }
          setHandlerFallback(e4) {
            this._handlerFb = e4;
          }
          dispose() {
            this._handlers = /* @__PURE__ */ Object.create(null), this._handlerFb = () => {
            }, this._active = n2;
          }
          reset() {
            if (2 === this._state) for (let e4 = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; e4 >= 0; --e4) this._active[e4].end(false);
            this._stack.paused = false, this._active = n2, this._id = -1, this._state = 0;
          }
          _start() {
            if (this._active = this._handlers[this._id] || n2, this._active.length) for (let e4 = this._active.length - 1; e4 >= 0; e4--) this._active[e4].start();
            else this._handlerFb(this._id, "START");
          }
          _put(e4, t4, i4) {
            if (this._active.length) for (let s4 = this._active.length - 1; s4 >= 0; s4--) this._active[s4].put(e4, t4, i4);
            else this._handlerFb(this._id, "PUT", (0, r2.utf32ToString)(e4, t4, i4));
          }
          start() {
            this.reset(), this._state = 1;
          }
          put(e4, t4, i4) {
            if (3 !== this._state) {
              if (1 === this._state) for (; t4 < i4; ) {
                const i5 = e4[t4++];
                if (59 === i5) {
                  this._state = 2, this._start();
                  break;
                }
                if (i5 < 48 || 57 < i5) return void (this._state = 3);
                -1 === this._id && (this._id = 0), this._id = 10 * this._id + i5 - 48;
              }
              2 === this._state && i4 - t4 > 0 && this._put(e4, t4, i4);
            }
          }
          end(e4, t4 = true) {
            if (0 !== this._state) {
              if (3 !== this._state) if (1 === this._state && this._start(), this._active.length) {
                let i4 = false, s4 = this._active.length - 1, r3 = false;
                if (this._stack.paused && (s4 = this._stack.loopPosition - 1, i4 = t4, r3 = this._stack.fallThrough, this._stack.paused = false), !r3 && false === i4) {
                  for (; s4 >= 0 && (i4 = this._active[s4].end(e4), true !== i4); s4--) if (i4 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s4, this._stack.fallThrough = false, i4;
                  s4--;
                }
                for (; s4 >= 0; s4--) if (i4 = this._active[s4].end(false), i4 instanceof Promise) return this._stack.paused = true, this._stack.loopPosition = s4, this._stack.fallThrough = true, i4;
              } else this._handlerFb(this._id, "END", e4);
              this._active = n2, this._id = -1, this._state = 0;
            }
          }
        }, t3.OscHandler = class {
          constructor(e4) {
            this._handler = e4, this._data = "", this._hitLimit = false;
          }
          start() {
            this._data = "", this._hitLimit = false;
          }
          put(e4, t4, i4) {
            this._hitLimit || (this._data += (0, r2.utf32ToString)(e4, t4, i4), this._data.length > s3.PAYLOAD_LIMIT && (this._data = "", this._hitLimit = true));
          }
          end(e4) {
            let t4 = false;
            if (this._hitLimit) t4 = false;
            else if (e4 && (t4 = this._handler(this._data), t4 instanceof Promise)) return t4.then(((e5) => (this._data = "", this._hitLimit = false, e5)));
            return this._data = "", this._hitLimit = false, t4;
          }
        };
      }, 8742: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Params = void 0;
        const i3 = 2147483647;
        class s3 {
          static fromArray(e4) {
            const t4 = new s3();
            if (!e4.length) return t4;
            for (let i4 = Array.isArray(e4[0]) ? 1 : 0; i4 < e4.length; ++i4) {
              const s4 = e4[i4];
              if (Array.isArray(s4)) for (let e5 = 0; e5 < s4.length; ++e5) t4.addSubParam(s4[e5]);
              else t4.addParam(s4);
            }
            return t4;
          }
          constructor(e4 = 32, t4 = 32) {
            if (this.maxLength = e4, this.maxSubParamsLength = t4, t4 > 256) throw new Error("maxSubParamsLength must not be greater than 256");
            this.params = new Int32Array(e4), this.length = 0, this._subParams = new Int32Array(t4), this._subParamsLength = 0, this._subParamsIdx = new Uint16Array(e4), this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          clone() {
            const e4 = new s3(this.maxLength, this.maxSubParamsLength);
            return e4.params.set(this.params), e4.length = this.length, e4._subParams.set(this._subParams), e4._subParamsLength = this._subParamsLength, e4._subParamsIdx.set(this._subParamsIdx), e4._rejectDigits = this._rejectDigits, e4._rejectSubDigits = this._rejectSubDigits, e4._digitIsSub = this._digitIsSub, e4;
          }
          toArray() {
            const e4 = [];
            for (let t4 = 0; t4 < this.length; ++t4) {
              e4.push(this.params[t4]);
              const i4 = this._subParamsIdx[t4] >> 8, s4 = 255 & this._subParamsIdx[t4];
              s4 - i4 > 0 && e4.push(Array.prototype.slice.call(this._subParams, i4, s4));
            }
            return e4;
          }
          reset() {
            this.length = 0, this._subParamsLength = 0, this._rejectDigits = false, this._rejectSubDigits = false, this._digitIsSub = false;
          }
          addParam(e4) {
            if (this._digitIsSub = false, this.length >= this.maxLength) this._rejectDigits = true;
            else {
              if (e4 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength, this.params[this.length++] = e4 > i3 ? i3 : e4;
            }
          }
          addSubParam(e4) {
            if (this._digitIsSub = true, this.length) if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) this._rejectSubDigits = true;
            else {
              if (e4 < -1) throw new Error("values lesser than -1 are not allowed");
              this._subParams[this._subParamsLength++] = e4 > i3 ? i3 : e4, this._subParamsIdx[this.length - 1]++;
            }
          }
          hasSubParams(e4) {
            return (255 & this._subParamsIdx[e4]) - (this._subParamsIdx[e4] >> 8) > 0;
          }
          getSubParams(e4) {
            const t4 = this._subParamsIdx[e4] >> 8, i4 = 255 & this._subParamsIdx[e4];
            return i4 - t4 > 0 ? this._subParams.subarray(t4, i4) : null;
          }
          getSubParamsAll() {
            const e4 = {};
            for (let t4 = 0; t4 < this.length; ++t4) {
              const i4 = this._subParamsIdx[t4] >> 8, s4 = 255 & this._subParamsIdx[t4];
              s4 - i4 > 0 && (e4[t4] = this._subParams.slice(i4, s4));
            }
            return e4;
          }
          addDigit(e4) {
            let t4;
            if (this._rejectDigits || !(t4 = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) return;
            const s4 = this._digitIsSub ? this._subParams : this.params, r2 = s4[t4 - 1];
            s4[t4 - 1] = ~r2 ? Math.min(10 * r2 + e4, i3) : e4;
          }
        }
        t3.Params = s3;
      }, 5741: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.AddonManager = void 0, t3.AddonManager = class {
          constructor() {
            this._addons = [];
          }
          dispose() {
            for (let e4 = this._addons.length - 1; e4 >= 0; e4--) this._addons[e4].instance.dispose();
          }
          loadAddon(e4, t4) {
            const i3 = { instance: t4, dispose: t4.dispose, isDisposed: false };
            this._addons.push(i3), t4.dispose = () => this._wrappedAddonDispose(i3), t4.activate(e4);
          }
          _wrappedAddonDispose(e4) {
            if (e4.isDisposed) return;
            let t4 = -1;
            for (let i3 = 0; i3 < this._addons.length; i3++) if (this._addons[i3] === e4) {
              t4 = i3;
              break;
            }
            if (-1 === t4) throw new Error("Could not dispose an addon that has not been loaded");
            e4.isDisposed = true, e4.dispose.apply(e4.instance), this._addons.splice(t4, 1);
          }
        };
      }, 8771: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferApiView = void 0;
        const s3 = i3(3785), r2 = i3(511);
        t3.BufferApiView = class {
          constructor(e4, t4) {
            this._buffer = e4, this.type = t4;
          }
          init(e4) {
            return this._buffer = e4, this;
          }
          get cursorY() {
            return this._buffer.y;
          }
          get cursorX() {
            return this._buffer.x;
          }
          get viewportY() {
            return this._buffer.ydisp;
          }
          get baseY() {
            return this._buffer.ybase;
          }
          get length() {
            return this._buffer.lines.length;
          }
          getLine(e4) {
            const t4 = this._buffer.lines.get(e4);
            if (t4) return new s3.BufferLineApiView(t4);
          }
          getNullCell() {
            return new r2.CellData();
          }
        };
      }, 3785: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferLineApiView = void 0;
        const s3 = i3(511);
        t3.BufferLineApiView = class {
          constructor(e4) {
            this._line = e4;
          }
          get isWrapped() {
            return this._line.isWrapped;
          }
          get length() {
            return this._line.length;
          }
          getCell(e4, t4) {
            if (!(e4 < 0 || e4 >= this._line.length)) return t4 ? (this._line.loadCell(e4, t4), t4) : this._line.loadCell(e4, new s3.CellData());
          }
          translateToString(e4, t4, i4) {
            return this._line.translateToString(e4, t4, i4);
          }
        };
      }, 8285: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferNamespaceApi = void 0;
        const s3 = i3(8771), r2 = i3(8460), n2 = i3(844);
        class o2 extends n2.Disposable {
          constructor(e4) {
            super(), this._core = e4, this._onBufferChange = this.register(new r2.EventEmitter()), this.onBufferChange = this._onBufferChange.event, this._normal = new s3.BufferApiView(this._core.buffers.normal, "normal"), this._alternate = new s3.BufferApiView(this._core.buffers.alt, "alternate"), this._core.buffers.onBufferActivate((() => this._onBufferChange.fire(this.active)));
          }
          get active() {
            if (this._core.buffers.active === this._core.buffers.normal) return this.normal;
            if (this._core.buffers.active === this._core.buffers.alt) return this.alternate;
            throw new Error("Active buffer is neither normal nor alternate");
          }
          get normal() {
            return this._normal.init(this._core.buffers.normal);
          }
          get alternate() {
            return this._alternate.init(this._core.buffers.alt);
          }
        }
        t3.BufferNamespaceApi = o2;
      }, 7975: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ParserApi = void 0, t3.ParserApi = class {
          constructor(e4) {
            this._core = e4;
          }
          registerCsiHandler(e4, t4) {
            return this._core.registerCsiHandler(e4, ((e5) => t4(e5.toArray())));
          }
          addCsiHandler(e4, t4) {
            return this.registerCsiHandler(e4, t4);
          }
          registerDcsHandler(e4, t4) {
            return this._core.registerDcsHandler(e4, ((e5, i3) => t4(e5, i3.toArray())));
          }
          addDcsHandler(e4, t4) {
            return this.registerDcsHandler(e4, t4);
          }
          registerEscHandler(e4, t4) {
            return this._core.registerEscHandler(e4, t4);
          }
          addEscHandler(e4, t4) {
            return this.registerEscHandler(e4, t4);
          }
          registerOscHandler(e4, t4) {
            return this._core.registerOscHandler(e4, t4);
          }
          addOscHandler(e4, t4) {
            return this.registerOscHandler(e4, t4);
          }
        };
      }, 7090: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeApi = void 0, t3.UnicodeApi = class {
          constructor(e4) {
            this._core = e4;
          }
          register(e4) {
            this._core.unicodeService.register(e4);
          }
          get versions() {
            return this._core.unicodeService.versions;
          }
          get activeVersion() {
            return this._core.unicodeService.activeVersion;
          }
          set activeVersion(e4) {
            this._core.unicodeService.activeVersion = e4;
          }
        };
      }, 744: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BufferService = t3.MINIMUM_ROWS = t3.MINIMUM_COLS = void 0;
        const n2 = i3(8460), o2 = i3(844), a2 = i3(5295), h2 = i3(2585);
        t3.MINIMUM_COLS = 2, t3.MINIMUM_ROWS = 1;
        let c2 = t3.BufferService = class extends o2.Disposable {
          get buffer() {
            return this.buffers.active;
          }
          constructor(e4) {
            super(), this.isUserScrolling = false, this._onResize = this.register(new n2.EventEmitter()), this.onResize = this._onResize.event, this._onScroll = this.register(new n2.EventEmitter()), this.onScroll = this._onScroll.event, this.cols = Math.max(e4.rawOptions.cols || 0, t3.MINIMUM_COLS), this.rows = Math.max(e4.rawOptions.rows || 0, t3.MINIMUM_ROWS), this.buffers = this.register(new a2.BufferSet(e4, this));
          }
          resize(e4, t4) {
            this.cols = e4, this.rows = t4, this.buffers.resize(e4, t4), this._onResize.fire({ cols: e4, rows: t4 });
          }
          reset() {
            this.buffers.reset(), this.isUserScrolling = false;
          }
          scroll(e4, t4 = false) {
            const i4 = this.buffer;
            let s4;
            s4 = this._cachedBlankLine, s4 && s4.length === this.cols && s4.getFg(0) === e4.fg && s4.getBg(0) === e4.bg || (s4 = i4.getBlankLine(e4, t4), this._cachedBlankLine = s4), s4.isWrapped = t4;
            const r3 = i4.ybase + i4.scrollTop, n3 = i4.ybase + i4.scrollBottom;
            if (0 === i4.scrollTop) {
              const e5 = i4.lines.isFull;
              n3 === i4.lines.length - 1 ? e5 ? i4.lines.recycle().copyFrom(s4) : i4.lines.push(s4.clone()) : i4.lines.splice(n3 + 1, 0, s4.clone()), e5 ? this.isUserScrolling && (i4.ydisp = Math.max(i4.ydisp - 1, 0)) : (i4.ybase++, this.isUserScrolling || i4.ydisp++);
            } else {
              const e5 = n3 - r3 + 1;
              i4.lines.shiftElements(r3 + 1, e5 - 1, -1), i4.lines.set(n3, s4.clone());
            }
            this.isUserScrolling || (i4.ydisp = i4.ybase), this._onScroll.fire(i4.ydisp);
          }
          scrollLines(e4, t4, i4) {
            const s4 = this.buffer;
            if (e4 < 0) {
              if (0 === s4.ydisp) return;
              this.isUserScrolling = true;
            } else e4 + s4.ydisp >= s4.ybase && (this.isUserScrolling = false);
            const r3 = s4.ydisp;
            s4.ydisp = Math.max(Math.min(s4.ydisp + e4, s4.ybase), 0), r3 !== s4.ydisp && (t4 || this._onScroll.fire(s4.ydisp));
          }
        };
        t3.BufferService = c2 = s3([r2(0, h2.IOptionsService)], c2);
      }, 7994: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CharsetService = void 0, t3.CharsetService = class {
          constructor() {
            this.glevel = 0, this._charsets = [];
          }
          reset() {
            this.charset = void 0, this._charsets = [], this.glevel = 0;
          }
          setgLevel(e4) {
            this.glevel = e4, this.charset = this._charsets[e4];
          }
          setgCharset(e4, t4) {
            this._charsets[e4] = t4, this.glevel === e4 && (this.charset = t4);
          }
        };
      }, 1753: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CoreMouseService = void 0;
        const n2 = i3(2585), o2 = i3(8460), a2 = i3(844), h2 = { NONE: { events: 0, restrict: () => false }, X10: { events: 1, restrict: (e4) => 4 !== e4.button && 1 === e4.action && (e4.ctrl = false, e4.alt = false, e4.shift = false, true) }, VT200: { events: 19, restrict: (e4) => 32 !== e4.action }, DRAG: { events: 23, restrict: (e4) => 32 !== e4.action || 3 !== e4.button }, ANY: { events: 31, restrict: (e4) => true } };
        function c2(e4, t4) {
          let i4 = (e4.ctrl ? 16 : 0) | (e4.shift ? 4 : 0) | (e4.alt ? 8 : 0);
          return 4 === e4.button ? (i4 |= 64, i4 |= e4.action) : (i4 |= 3 & e4.button, 4 & e4.button && (i4 |= 64), 8 & e4.button && (i4 |= 128), 32 === e4.action ? i4 |= 32 : 0 !== e4.action || t4 || (i4 |= 3)), i4;
        }
        const l2 = String.fromCharCode, d2 = { DEFAULT: (e4) => {
          const t4 = [c2(e4, false) + 32, e4.col + 32, e4.row + 32];
          return t4[0] > 255 || t4[1] > 255 || t4[2] > 255 ? "" : `\x1B[M${l2(t4[0])}${l2(t4[1])}${l2(t4[2])}`;
        }, SGR: (e4) => {
          const t4 = 0 === e4.action && 4 !== e4.button ? "m" : "M";
          return `\x1B[<${c2(e4, true)};${e4.col};${e4.row}${t4}`;
        }, SGR_PIXELS: (e4) => {
          const t4 = 0 === e4.action && 4 !== e4.button ? "m" : "M";
          return `\x1B[<${c2(e4, true)};${e4.x};${e4.y}${t4}`;
        } };
        let _2 = t3.CoreMouseService = class extends a2.Disposable {
          constructor(e4, t4) {
            super(), this._bufferService = e4, this._coreService = t4, this._protocols = {}, this._encodings = {}, this._activeProtocol = "", this._activeEncoding = "", this._lastEvent = null, this._onProtocolChange = this.register(new o2.EventEmitter()), this.onProtocolChange = this._onProtocolChange.event;
            for (const e5 of Object.keys(h2)) this.addProtocol(e5, h2[e5]);
            for (const e5 of Object.keys(d2)) this.addEncoding(e5, d2[e5]);
            this.reset();
          }
          addProtocol(e4, t4) {
            this._protocols[e4] = t4;
          }
          addEncoding(e4, t4) {
            this._encodings[e4] = t4;
          }
          get activeProtocol() {
            return this._activeProtocol;
          }
          get areMouseEventsActive() {
            return 0 !== this._protocols[this._activeProtocol].events;
          }
          set activeProtocol(e4) {
            if (!this._protocols[e4]) throw new Error(`unknown protocol "${e4}"`);
            this._activeProtocol = e4, this._onProtocolChange.fire(this._protocols[e4].events);
          }
          get activeEncoding() {
            return this._activeEncoding;
          }
          set activeEncoding(e4) {
            if (!this._encodings[e4]) throw new Error(`unknown encoding "${e4}"`);
            this._activeEncoding = e4;
          }
          reset() {
            this.activeProtocol = "NONE", this.activeEncoding = "DEFAULT", this._lastEvent = null;
          }
          triggerMouseEvent(e4) {
            if (e4.col < 0 || e4.col >= this._bufferService.cols || e4.row < 0 || e4.row >= this._bufferService.rows) return false;
            if (4 === e4.button && 32 === e4.action) return false;
            if (3 === e4.button && 32 !== e4.action) return false;
            if (4 !== e4.button && (2 === e4.action || 3 === e4.action)) return false;
            if (e4.col++, e4.row++, 32 === e4.action && this._lastEvent && this._equalEvents(this._lastEvent, e4, "SGR_PIXELS" === this._activeEncoding)) return false;
            if (!this._protocols[this._activeProtocol].restrict(e4)) return false;
            const t4 = this._encodings[this._activeEncoding](e4);
            return t4 && ("DEFAULT" === this._activeEncoding ? this._coreService.triggerBinaryEvent(t4) : this._coreService.triggerDataEvent(t4, true)), this._lastEvent = e4, true;
          }
          explainEvents(e4) {
            return { down: !!(1 & e4), up: !!(2 & e4), drag: !!(4 & e4), move: !!(8 & e4), wheel: !!(16 & e4) };
          }
          _equalEvents(e4, t4, i4) {
            if (i4) {
              if (e4.x !== t4.x) return false;
              if (e4.y !== t4.y) return false;
            } else {
              if (e4.col !== t4.col) return false;
              if (e4.row !== t4.row) return false;
            }
            return e4.button === t4.button && e4.action === t4.action && e4.ctrl === t4.ctrl && e4.alt === t4.alt && e4.shift === t4.shift;
          }
        };
        t3.CoreMouseService = _2 = s3([r2(0, n2.IBufferService), r2(1, n2.ICoreService)], _2);
      }, 6975: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CoreService = void 0;
        const n2 = i3(1439), o2 = i3(8460), a2 = i3(844), h2 = i3(2585), c2 = Object.freeze({ insertMode: false }), l2 = Object.freeze({ applicationCursorKeys: false, applicationKeypad: false, bracketedPasteMode: false, origin: false, reverseWraparound: false, sendFocus: false, wraparound: true });
        let d2 = t3.CoreService = class extends a2.Disposable {
          constructor(e4, t4, i4) {
            super(), this._bufferService = e4, this._logService = t4, this._optionsService = i4, this.isCursorInitialized = false, this.isCursorHidden = false, this._onData = this.register(new o2.EventEmitter()), this.onData = this._onData.event, this._onUserInput = this.register(new o2.EventEmitter()), this.onUserInput = this._onUserInput.event, this._onBinary = this.register(new o2.EventEmitter()), this.onBinary = this._onBinary.event, this._onRequestScrollToBottom = this.register(new o2.EventEmitter()), this.onRequestScrollToBottom = this._onRequestScrollToBottom.event, this.modes = (0, n2.clone)(c2), this.decPrivateModes = (0, n2.clone)(l2);
          }
          reset() {
            this.modes = (0, n2.clone)(c2), this.decPrivateModes = (0, n2.clone)(l2);
          }
          triggerDataEvent(e4, t4 = false) {
            if (this._optionsService.rawOptions.disableStdin) return;
            const i4 = this._bufferService.buffer;
            t4 && this._optionsService.rawOptions.scrollOnUserInput && i4.ybase !== i4.ydisp && this._onRequestScrollToBottom.fire(), t4 && this._onUserInput.fire(), this._logService.debug(`sending data "${e4}"`, (() => e4.split("").map(((e5) => e5.charCodeAt(0))))), this._onData.fire(e4);
          }
          triggerBinaryEvent(e4) {
            this._optionsService.rawOptions.disableStdin || (this._logService.debug(`sending binary "${e4}"`, (() => e4.split("").map(((e5) => e5.charCodeAt(0))))), this._onBinary.fire(e4));
          }
        };
        t3.CoreService = d2 = s3([r2(0, h2.IBufferService), r2(1, h2.ILogService), r2(2, h2.IOptionsService)], d2);
      }, 9074: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DecorationService = void 0;
        const s3 = i3(8055), r2 = i3(8460), n2 = i3(844), o2 = i3(6106);
        let a2 = 0, h2 = 0;
        class c2 extends n2.Disposable {
          get decorations() {
            return this._decorations.values();
          }
          constructor() {
            super(), this._decorations = new o2.SortedList(((e4) => e4?.marker.line)), this._onDecorationRegistered = this.register(new r2.EventEmitter()), this.onDecorationRegistered = this._onDecorationRegistered.event, this._onDecorationRemoved = this.register(new r2.EventEmitter()), this.onDecorationRemoved = this._onDecorationRemoved.event, this.register((0, n2.toDisposable)((() => this.reset())));
          }
          registerDecoration(e4) {
            if (e4.marker.isDisposed) return;
            const t4 = new l2(e4);
            if (t4) {
              const e5 = t4.marker.onDispose((() => t4.dispose()));
              t4.onDispose((() => {
                t4 && (this._decorations.delete(t4) && this._onDecorationRemoved.fire(t4), e5.dispose());
              })), this._decorations.insert(t4), this._onDecorationRegistered.fire(t4);
            }
            return t4;
          }
          reset() {
            for (const e4 of this._decorations.values()) e4.dispose();
            this._decorations.clear();
          }
          *getDecorationsAtCell(e4, t4, i4) {
            let s4 = 0, r3 = 0;
            for (const n3 of this._decorations.getKeyIterator(t4)) s4 = n3.options.x ?? 0, r3 = s4 + (n3.options.width ?? 1), e4 >= s4 && e4 < r3 && (!i4 || (n3.options.layer ?? "bottom") === i4) && (yield n3);
          }
          forEachDecorationAtCell(e4, t4, i4, s4) {
            this._decorations.forEachByKey(t4, ((t5) => {
              a2 = t5.options.x ?? 0, h2 = a2 + (t5.options.width ?? 1), e4 >= a2 && e4 < h2 && (!i4 || (t5.options.layer ?? "bottom") === i4) && s4(t5);
            }));
          }
        }
        t3.DecorationService = c2;
        class l2 extends n2.Disposable {
          get isDisposed() {
            return this._isDisposed;
          }
          get backgroundColorRGB() {
            return null === this._cachedBg && (this.options.backgroundColor ? this._cachedBg = s3.css.toColor(this.options.backgroundColor) : this._cachedBg = void 0), this._cachedBg;
          }
          get foregroundColorRGB() {
            return null === this._cachedFg && (this.options.foregroundColor ? this._cachedFg = s3.css.toColor(this.options.foregroundColor) : this._cachedFg = void 0), this._cachedFg;
          }
          constructor(e4) {
            super(), this.options = e4, this.onRenderEmitter = this.register(new r2.EventEmitter()), this.onRender = this.onRenderEmitter.event, this._onDispose = this.register(new r2.EventEmitter()), this.onDispose = this._onDispose.event, this._cachedBg = null, this._cachedFg = null, this.marker = e4.marker, this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position && (this.options.overviewRulerOptions.position = "full");
          }
          dispose() {
            this._onDispose.fire(), super.dispose();
          }
        }
      }, 4348: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.InstantiationService = t3.ServiceCollection = void 0;
        const s3 = i3(2585), r2 = i3(8343);
        class n2 {
          constructor(...e4) {
            this._entries = /* @__PURE__ */ new Map();
            for (const [t4, i4] of e4) this.set(t4, i4);
          }
          set(e4, t4) {
            const i4 = this._entries.get(e4);
            return this._entries.set(e4, t4), i4;
          }
          forEach(e4) {
            for (const [t4, i4] of this._entries.entries()) e4(t4, i4);
          }
          has(e4) {
            return this._entries.has(e4);
          }
          get(e4) {
            return this._entries.get(e4);
          }
        }
        t3.ServiceCollection = n2, t3.InstantiationService = class {
          constructor() {
            this._services = new n2(), this._services.set(s3.IInstantiationService, this);
          }
          setService(e4, t4) {
            this._services.set(e4, t4);
          }
          getService(e4) {
            return this._services.get(e4);
          }
          createInstance(e4, ...t4) {
            const i4 = (0, r2.getServiceDependencies)(e4).sort(((e5, t5) => e5.index - t5.index)), s4 = [];
            for (const t5 of i4) {
              const i5 = this._services.get(t5.id);
              if (!i5) throw new Error(`[createInstance] ${e4.name} depends on UNKNOWN service ${t5.id}.`);
              s4.push(i5);
            }
            const n3 = i4.length > 0 ? i4[0].index : t4.length;
            if (t4.length !== n3) throw new Error(`[createInstance] First service dependency of ${e4.name} at position ${n3 + 1} conflicts with ${t4.length} static arguments`);
            return new e4(...[...t4, ...s4]);
          }
        };
      }, 7866: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.traceCall = t3.setTraceLogger = t3.LogService = void 0;
        const n2 = i3(844), o2 = i3(2585), a2 = { trace: o2.LogLevelEnum.TRACE, debug: o2.LogLevelEnum.DEBUG, info: o2.LogLevelEnum.INFO, warn: o2.LogLevelEnum.WARN, error: o2.LogLevelEnum.ERROR, off: o2.LogLevelEnum.OFF };
        let h2, c2 = t3.LogService = class extends n2.Disposable {
          get logLevel() {
            return this._logLevel;
          }
          constructor(e4) {
            super(), this._optionsService = e4, this._logLevel = o2.LogLevelEnum.OFF, this._updateLogLevel(), this.register(this._optionsService.onSpecificOptionChange("logLevel", (() => this._updateLogLevel()))), h2 = this;
          }
          _updateLogLevel() {
            this._logLevel = a2[this._optionsService.rawOptions.logLevel];
          }
          _evalLazyOptionalParams(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) "function" == typeof e4[t4] && (e4[t4] = e4[t4]());
          }
          _log(e4, t4, i4) {
            this._evalLazyOptionalParams(i4), e4.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t4, ...i4);
          }
          trace(e4, ...t4) {
            this._logLevel <= o2.LogLevelEnum.TRACE && this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, e4, t4);
          }
          debug(e4, ...t4) {
            this._logLevel <= o2.LogLevelEnum.DEBUG && this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, e4, t4);
          }
          info(e4, ...t4) {
            this._logLevel <= o2.LogLevelEnum.INFO && this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, e4, t4);
          }
          warn(e4, ...t4) {
            this._logLevel <= o2.LogLevelEnum.WARN && this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, e4, t4);
          }
          error(e4, ...t4) {
            this._logLevel <= o2.LogLevelEnum.ERROR && this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, e4, t4);
          }
        };
        t3.LogService = c2 = s3([r2(0, o2.IOptionsService)], c2), t3.setTraceLogger = function(e4) {
          h2 = e4;
        }, t3.traceCall = function(e4, t4, i4) {
          if ("function" != typeof i4.value) throw new Error("not supported");
          const s4 = i4.value;
          i4.value = function(...e5) {
            if (h2.logLevel !== o2.LogLevelEnum.TRACE) return s4.apply(this, e5);
            h2.trace(`GlyphRenderer#${s4.name}(${e5.map(((e6) => JSON.stringify(e6))).join(", ")})`);
            const t5 = s4.apply(this, e5);
            return h2.trace(`GlyphRenderer#${s4.name} return`, t5), t5;
          };
        };
      }, 7302: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.OptionsService = t3.DEFAULT_OPTIONS = void 0;
        const s3 = i3(8460), r2 = i3(844), n2 = i3(6114);
        t3.DEFAULT_OPTIONS = { cols: 80, rows: 24, cursorBlink: false, cursorStyle: "block", cursorWidth: 1, cursorInactiveStyle: "outline", customGlyphs: true, drawBoldTextInBrightColors: true, documentOverride: null, fastScrollModifier: "alt", fastScrollSensitivity: 5, fontFamily: "courier-new, courier, monospace", fontSize: 15, fontWeight: "normal", fontWeightBold: "bold", ignoreBracketedPasteMode: false, lineHeight: 1, letterSpacing: 0, linkHandler: null, logLevel: "info", logger: null, scrollback: 1e3, scrollOnUserInput: true, scrollSensitivity: 1, screenReaderMode: false, smoothScrollDuration: 0, macOptionIsMeta: false, macOptionClickForcesSelection: false, minimumContrastRatio: 1, disableStdin: false, allowProposedApi: false, allowTransparency: false, tabStopWidth: 8, theme: {}, rescaleOverlappingGlyphs: false, rightClickSelectsWord: n2.isMac, windowOptions: {}, windowsMode: false, windowsPty: {}, wordSeparator: " ()[]{}',\"`", altClickMovesCursor: true, convertEol: false, termName: "xterm", cancelEvents: false, overviewRulerWidth: 0 };
        const o2 = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
        class a2 extends r2.Disposable {
          constructor(e4) {
            super(), this._onOptionChange = this.register(new s3.EventEmitter()), this.onOptionChange = this._onOptionChange.event;
            const i4 = { ...t3.DEFAULT_OPTIONS };
            for (const t4 in e4) if (t4 in i4) try {
              const s4 = e4[t4];
              i4[t4] = this._sanitizeAndValidateOption(t4, s4);
            } catch (e5) {
              console.error(e5);
            }
            this.rawOptions = i4, this.options = { ...i4 }, this._setupOptions(), this.register((0, r2.toDisposable)((() => {
              this.rawOptions.linkHandler = null, this.rawOptions.documentOverride = null;
            })));
          }
          onSpecificOptionChange(e4, t4) {
            return this.onOptionChange(((i4) => {
              i4 === e4 && t4(this.rawOptions[e4]);
            }));
          }
          onMultipleOptionChange(e4, t4) {
            return this.onOptionChange(((i4) => {
              -1 !== e4.indexOf(i4) && t4();
            }));
          }
          _setupOptions() {
            const e4 = (e5) => {
              if (!(e5 in t3.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e5}"`);
              return this.rawOptions[e5];
            }, i4 = (e5, i5) => {
              if (!(e5 in t3.DEFAULT_OPTIONS)) throw new Error(`No option with key "${e5}"`);
              i5 = this._sanitizeAndValidateOption(e5, i5), this.rawOptions[e5] !== i5 && (this.rawOptions[e5] = i5, this._onOptionChange.fire(e5));
            };
            for (const t4 in this.rawOptions) {
              const s4 = { get: e4.bind(this, t4), set: i4.bind(this, t4) };
              Object.defineProperty(this.options, t4, s4);
            }
          }
          _sanitizeAndValidateOption(e4, i4) {
            switch (e4) {
              case "cursorStyle":
                if (i4 || (i4 = t3.DEFAULT_OPTIONS[e4]), !/* @__PURE__ */ (function(e5) {
                  return "block" === e5 || "underline" === e5 || "bar" === e5;
                })(i4)) throw new Error(`"${i4}" is not a valid value for ${e4}`);
                break;
              case "wordSeparator":
                i4 || (i4 = t3.DEFAULT_OPTIONS[e4]);
                break;
              case "fontWeight":
              case "fontWeightBold":
                if ("number" == typeof i4 && 1 <= i4 && i4 <= 1e3) break;
                i4 = o2.includes(i4) ? i4 : t3.DEFAULT_OPTIONS[e4];
                break;
              case "cursorWidth":
                i4 = Math.floor(i4);
              case "lineHeight":
              case "tabStopWidth":
                if (i4 < 1) throw new Error(`${e4} cannot be less than 1, value: ${i4}`);
                break;
              case "minimumContrastRatio":
                i4 = Math.max(1, Math.min(21, Math.round(10 * i4) / 10));
                break;
              case "scrollback":
                if ((i4 = Math.min(i4, 4294967295)) < 0) throw new Error(`${e4} cannot be less than 0, value: ${i4}`);
                break;
              case "fastScrollSensitivity":
              case "scrollSensitivity":
                if (i4 <= 0) throw new Error(`${e4} cannot be less than or equal to 0, value: ${i4}`);
                break;
              case "rows":
              case "cols":
                if (!i4 && 0 !== i4) throw new Error(`${e4} must be numeric, value: ${i4}`);
                break;
              case "windowsPty":
                i4 = i4 ?? {};
            }
            return i4;
          }
        }
        t3.OptionsService = a2;
      }, 2660: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, n3 = arguments.length, o3 = n3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) o3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a2 = e4.length - 1; a2 >= 0; a2--) (r3 = e4[a2]) && (o3 = (n3 < 3 ? r3(o3) : n3 > 3 ? r3(t4, i4, o3) : r3(t4, i4)) || o3);
          return n3 > 3 && o3 && Object.defineProperty(t4, i4, o3), o3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.OscLinkService = void 0;
        const n2 = i3(2585);
        let o2 = t3.OscLinkService = class {
          constructor(e4) {
            this._bufferService = e4, this._nextId = 1, this._entriesWithId = /* @__PURE__ */ new Map(), this._dataByLinkId = /* @__PURE__ */ new Map();
          }
          registerLink(e4) {
            const t4 = this._bufferService.buffer;
            if (void 0 === e4.id) {
              const i5 = t4.addMarker(t4.ybase + t4.y), s5 = { data: e4, id: this._nextId++, lines: [i5] };
              return i5.onDispose((() => this._removeMarkerFromLink(s5, i5))), this._dataByLinkId.set(s5.id, s5), s5.id;
            }
            const i4 = e4, s4 = this._getEntryIdKey(i4), r3 = this._entriesWithId.get(s4);
            if (r3) return this.addLineToLink(r3.id, t4.ybase + t4.y), r3.id;
            const n3 = t4.addMarker(t4.ybase + t4.y), o3 = { id: this._nextId++, key: this._getEntryIdKey(i4), data: i4, lines: [n3] };
            return n3.onDispose((() => this._removeMarkerFromLink(o3, n3))), this._entriesWithId.set(o3.key, o3), this._dataByLinkId.set(o3.id, o3), o3.id;
          }
          addLineToLink(e4, t4) {
            const i4 = this._dataByLinkId.get(e4);
            if (i4 && i4.lines.every(((e5) => e5.line !== t4))) {
              const e5 = this._bufferService.buffer.addMarker(t4);
              i4.lines.push(e5), e5.onDispose((() => this._removeMarkerFromLink(i4, e5)));
            }
          }
          getLinkData(e4) {
            return this._dataByLinkId.get(e4)?.data;
          }
          _getEntryIdKey(e4) {
            return `${e4.id};;${e4.uri}`;
          }
          _removeMarkerFromLink(e4, t4) {
            const i4 = e4.lines.indexOf(t4);
            -1 !== i4 && (e4.lines.splice(i4, 1), 0 === e4.lines.length && (void 0 !== e4.data.id && this._entriesWithId.delete(e4.key), this._dataByLinkId.delete(e4.id)));
          }
        };
        t3.OscLinkService = o2 = s3([r2(0, n2.IBufferService)], o2);
      }, 8343: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.createDecorator = t3.getServiceDependencies = t3.serviceRegistry = void 0;
        const i3 = "di$target", s3 = "di$dependencies";
        t3.serviceRegistry = /* @__PURE__ */ new Map(), t3.getServiceDependencies = function(e4) {
          return e4[s3] || [];
        }, t3.createDecorator = function(e4) {
          if (t3.serviceRegistry.has(e4)) return t3.serviceRegistry.get(e4);
          const r2 = function(e5, t4, n2) {
            if (3 !== arguments.length) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
            !(function(e6, t5, r3) {
              t5[i3] === t5 ? t5[s3].push({ id: e6, index: r3 }) : (t5[s3] = [{ id: e6, index: r3 }], t5[i3] = t5);
            })(r2, e5, n2);
          };
          return r2.toString = () => e4, t3.serviceRegistry.set(e4, r2), r2;
        };
      }, 2585: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.IDecorationService = t3.IUnicodeService = t3.IOscLinkService = t3.IOptionsService = t3.ILogService = t3.LogLevelEnum = t3.IInstantiationService = t3.ICharsetService = t3.ICoreService = t3.ICoreMouseService = t3.IBufferService = void 0;
        const s3 = i3(8343);
        var r2;
        t3.IBufferService = (0, s3.createDecorator)("BufferService"), t3.ICoreMouseService = (0, s3.createDecorator)("CoreMouseService"), t3.ICoreService = (0, s3.createDecorator)("CoreService"), t3.ICharsetService = (0, s3.createDecorator)("CharsetService"), t3.IInstantiationService = (0, s3.createDecorator)("InstantiationService"), (function(e4) {
          e4[e4.TRACE = 0] = "TRACE", e4[e4.DEBUG = 1] = "DEBUG", e4[e4.INFO = 2] = "INFO", e4[e4.WARN = 3] = "WARN", e4[e4.ERROR = 4] = "ERROR", e4[e4.OFF = 5] = "OFF";
        })(r2 || (t3.LogLevelEnum = r2 = {})), t3.ILogService = (0, s3.createDecorator)("LogService"), t3.IOptionsService = (0, s3.createDecorator)("OptionsService"), t3.IOscLinkService = (0, s3.createDecorator)("OscLinkService"), t3.IUnicodeService = (0, s3.createDecorator)("UnicodeService"), t3.IDecorationService = (0, s3.createDecorator)("DecorationService");
      }, 1480: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeService = void 0;
        const s3 = i3(8460), r2 = i3(225);
        class n2 {
          static extractShouldJoin(e4) {
            return 0 != (1 & e4);
          }
          static extractWidth(e4) {
            return e4 >> 1 & 3;
          }
          static extractCharKind(e4) {
            return e4 >> 3;
          }
          static createPropertyValue(e4, t4, i4 = false) {
            return (16777215 & e4) << 3 | (3 & t4) << 1 | (i4 ? 1 : 0);
          }
          constructor() {
            this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new s3.EventEmitter(), this.onChange = this._onChange.event;
            const e4 = new r2.UnicodeV6();
            this.register(e4), this._active = e4.version, this._activeProvider = e4;
          }
          dispose() {
            this._onChange.dispose();
          }
          get versions() {
            return Object.keys(this._providers);
          }
          get activeVersion() {
            return this._active;
          }
          set activeVersion(e4) {
            if (!this._providers[e4]) throw new Error(`unknown Unicode version "${e4}"`);
            this._active = e4, this._activeProvider = this._providers[e4], this._onChange.fire(e4);
          }
          register(e4) {
            this._providers[e4.version] = e4;
          }
          wcwidth(e4) {
            return this._activeProvider.wcwidth(e4);
          }
          getStringCellWidth(e4) {
            let t4 = 0, i4 = 0;
            const s4 = e4.length;
            for (let r3 = 0; r3 < s4; ++r3) {
              let o2 = e4.charCodeAt(r3);
              if (55296 <= o2 && o2 <= 56319) {
                if (++r3 >= s4) return t4 + this.wcwidth(o2);
                const i5 = e4.charCodeAt(r3);
                56320 <= i5 && i5 <= 57343 ? o2 = 1024 * (o2 - 55296) + i5 - 56320 + 65536 : t4 += this.wcwidth(i5);
              }
              const a2 = this.charProperties(o2, i4);
              let h2 = n2.extractWidth(a2);
              n2.extractShouldJoin(a2) && (h2 -= n2.extractWidth(i4)), t4 += h2, i4 = a2;
            }
            return t4;
          }
          charProperties(e4, t4) {
            return this._activeProvider.charProperties(e4, t4);
          }
        }
        t3.UnicodeService = n2;
      } }, t2 = {};
      function i2(s3) {
        var r2 = t2[s3];
        if (void 0 !== r2) return r2.exports;
        var n2 = t2[s3] = { exports: {} };
        return e2[s3].call(n2.exports, n2, n2.exports, i2), n2.exports;
      }
      var s2 = {};
      return (() => {
        var e3 = s2;
        Object.defineProperty(e3, "__esModule", { value: true }), e3.Terminal = void 0;
        const t3 = i2(9042), r2 = i2(3236), n2 = i2(844), o2 = i2(5741), a2 = i2(8285), h2 = i2(7975), c2 = i2(7090), l2 = ["cols", "rows"];
        class d2 extends n2.Disposable {
          constructor(e4) {
            super(), this._core = this.register(new r2.Terminal(e4)), this._addonManager = this.register(new o2.AddonManager()), this._publicOptions = { ...this._core.options };
            const t4 = (e5) => this._core.options[e5], i3 = (e5, t5) => {
              this._checkReadonlyOptions(e5), this._core.options[e5] = t5;
            };
            for (const e5 in this._core.options) {
              const s3 = { get: t4.bind(this, e5), set: i3.bind(this, e5) };
              Object.defineProperty(this._publicOptions, e5, s3);
            }
          }
          _checkReadonlyOptions(e4) {
            if (l2.includes(e4)) throw new Error(`Option "${e4}" can only be set in the constructor`);
          }
          _checkProposedApi() {
            if (!this._core.optionsService.rawOptions.allowProposedApi) throw new Error("You must set the allowProposedApi option to true to use proposed API");
          }
          get onBell() {
            return this._core.onBell;
          }
          get onBinary() {
            return this._core.onBinary;
          }
          get onCursorMove() {
            return this._core.onCursorMove;
          }
          get onData() {
            return this._core.onData;
          }
          get onKey() {
            return this._core.onKey;
          }
          get onLineFeed() {
            return this._core.onLineFeed;
          }
          get onRender() {
            return this._core.onRender;
          }
          get onResize() {
            return this._core.onResize;
          }
          get onScroll() {
            return this._core.onScroll;
          }
          get onSelectionChange() {
            return this._core.onSelectionChange;
          }
          get onTitleChange() {
            return this._core.onTitleChange;
          }
          get onWriteParsed() {
            return this._core.onWriteParsed;
          }
          get element() {
            return this._core.element;
          }
          get parser() {
            return this._parser || (this._parser = new h2.ParserApi(this._core)), this._parser;
          }
          get unicode() {
            return this._checkProposedApi(), new c2.UnicodeApi(this._core);
          }
          get textarea() {
            return this._core.textarea;
          }
          get rows() {
            return this._core.rows;
          }
          get cols() {
            return this._core.cols;
          }
          get buffer() {
            return this._buffer || (this._buffer = this.register(new a2.BufferNamespaceApi(this._core))), this._buffer;
          }
          get markers() {
            return this._checkProposedApi(), this._core.markers;
          }
          get modes() {
            const e4 = this._core.coreService.decPrivateModes;
            let t4 = "none";
            switch (this._core.coreMouseService.activeProtocol) {
              case "X10":
                t4 = "x10";
                break;
              case "VT200":
                t4 = "vt200";
                break;
              case "DRAG":
                t4 = "drag";
                break;
              case "ANY":
                t4 = "any";
            }
            return { applicationCursorKeysMode: e4.applicationCursorKeys, applicationKeypadMode: e4.applicationKeypad, bracketedPasteMode: e4.bracketedPasteMode, insertMode: this._core.coreService.modes.insertMode, mouseTrackingMode: t4, originMode: e4.origin, reverseWraparoundMode: e4.reverseWraparound, sendFocusMode: e4.sendFocus, wraparoundMode: e4.wraparound };
          }
          get options() {
            return this._publicOptions;
          }
          set options(e4) {
            for (const t4 in e4) this._publicOptions[t4] = e4[t4];
          }
          blur() {
            this._core.blur();
          }
          focus() {
            this._core.focus();
          }
          input(e4, t4 = true) {
            this._core.input(e4, t4);
          }
          resize(e4, t4) {
            this._verifyIntegers(e4, t4), this._core.resize(e4, t4);
          }
          open(e4) {
            this._core.open(e4);
          }
          attachCustomKeyEventHandler(e4) {
            this._core.attachCustomKeyEventHandler(e4);
          }
          attachCustomWheelEventHandler(e4) {
            this._core.attachCustomWheelEventHandler(e4);
          }
          registerLinkProvider(e4) {
            return this._core.registerLinkProvider(e4);
          }
          registerCharacterJoiner(e4) {
            return this._checkProposedApi(), this._core.registerCharacterJoiner(e4);
          }
          deregisterCharacterJoiner(e4) {
            this._checkProposedApi(), this._core.deregisterCharacterJoiner(e4);
          }
          registerMarker(e4 = 0) {
            return this._verifyIntegers(e4), this._core.registerMarker(e4);
          }
          registerDecoration(e4) {
            return this._checkProposedApi(), this._verifyPositiveIntegers(e4.x ?? 0, e4.width ?? 0, e4.height ?? 0), this._core.registerDecoration(e4);
          }
          hasSelection() {
            return this._core.hasSelection();
          }
          select(e4, t4, i3) {
            this._verifyIntegers(e4, t4, i3), this._core.select(e4, t4, i3);
          }
          getSelection() {
            return this._core.getSelection();
          }
          getSelectionPosition() {
            return this._core.getSelectionPosition();
          }
          clearSelection() {
            this._core.clearSelection();
          }
          selectAll() {
            this._core.selectAll();
          }
          selectLines(e4, t4) {
            this._verifyIntegers(e4, t4), this._core.selectLines(e4, t4);
          }
          dispose() {
            super.dispose();
          }
          scrollLines(e4) {
            this._verifyIntegers(e4), this._core.scrollLines(e4);
          }
          scrollPages(e4) {
            this._verifyIntegers(e4), this._core.scrollPages(e4);
          }
          scrollToTop() {
            this._core.scrollToTop();
          }
          scrollToBottom() {
            this._core.scrollToBottom();
          }
          scrollToLine(e4) {
            this._verifyIntegers(e4), this._core.scrollToLine(e4);
          }
          clear() {
            this._core.clear();
          }
          write(e4, t4) {
            this._core.write(e4, t4);
          }
          writeln(e4, t4) {
            this._core.write(e4), this._core.write("\r\n", t4);
          }
          paste(e4) {
            this._core.paste(e4);
          }
          refresh(e4, t4) {
            this._verifyIntegers(e4, t4), this._core.refresh(e4, t4);
          }
          reset() {
            this._core.reset();
          }
          clearTextureAtlas() {
            this._core.clearTextureAtlas();
          }
          loadAddon(e4) {
            this._addonManager.loadAddon(this, e4);
          }
          static get strings() {
            return t3;
          }
          _verifyIntegers(...e4) {
            for (const t4 of e4) if (t4 === 1 / 0 || isNaN(t4) || t4 % 1 != 0) throw new Error("This API only accepts integers");
          }
          _verifyPositiveIntegers(...e4) {
            for (const t4 of e4) if (t4 && (t4 === 1 / 0 || isNaN(t4) || t4 % 1 != 0 || t4 < 0)) throw new Error("This API only accepts positive integers");
          }
        }
        e3.Terminal = d2;
      })(), s2;
    })()));
  })(xterm);
  return xterm.exports;
}
var xtermExports = requireXterm();
var addonWebgl = { exports: {} };
var hasRequiredAddonWebgl;
function requireAddonWebgl() {
  if (hasRequiredAddonWebgl) return addonWebgl.exports;
  hasRequiredAddonWebgl = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(self, (() => (() => {
      var e2 = { 965: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.GlyphRenderer = void 0;
        const s3 = i3(374), r2 = i3(509), o2 = i3(855), n2 = i3(859), a2 = i3(381), h2 = 11, l2 = h2 * Float32Array.BYTES_PER_ELEMENT;
        let c2, d2 = 0, _2 = 0, u2 = 0;
        class g2 extends n2.Disposable {
          constructor(e4, t4, i4) {
            super(), this._terminal = e4, this._gl = t4, this._dimensions = i4, this._activeBuffer = 0, this._vertices = { count: 0, attributes: new Float32Array(0), attributesBuffers: [new Float32Array(0), new Float32Array(0)] };
            const o3 = this._gl;
            void 0 === r2.TextureAtlas.maxAtlasPages && (r2.TextureAtlas.maxAtlasPages = Math.min(32, (0, s3.throwIfFalsy)(o3.getParameter(o3.MAX_TEXTURE_IMAGE_UNITS))), r2.TextureAtlas.maxTextureSize = (0, s3.throwIfFalsy)(o3.getParameter(o3.MAX_TEXTURE_SIZE))), this._program = (0, s3.throwIfFalsy)((0, a2.createProgram)(o3, "#version 300 es\nlayout (location = 0) in vec2 a_unitquad;\nlayout (location = 1) in vec2 a_cellpos;\nlayout (location = 2) in vec2 a_offset;\nlayout (location = 3) in vec2 a_size;\nlayout (location = 4) in float a_texpage;\nlayout (location = 5) in vec2 a_texcoord;\nlayout (location = 6) in vec2 a_texsize;\n\nuniform mat4 u_projection;\nuniform vec2 u_resolution;\n\nout vec2 v_texcoord;\nflat out int v_texpage;\n\nvoid main() {\n  vec2 zeroToOne = (a_offset / u_resolution) + a_cellpos + (a_unitquad * a_size);\n  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);\n  v_texpage = int(a_texpage);\n  v_texcoord = a_texcoord + a_unitquad * a_texsize;\n}", (function(e5) {
              let t5 = "";
              for (let i5 = 1; i5 < e5; i5++) t5 += ` else if (v_texpage == ${i5}) { outColor = texture(u_texture[${i5}], v_texcoord); }`;
              return `#version 300 es
precision lowp float;

in vec2 v_texcoord;
flat in int v_texpage;

uniform sampler2D u_texture[${e5}];

out vec4 outColor;

void main() {
  if (v_texpage == 0) {
    outColor = texture(u_texture[0], v_texcoord);
  } ${t5}
}`;
            })(r2.TextureAtlas.maxAtlasPages))), this.register((0, n2.toDisposable)((() => o3.deleteProgram(this._program)))), this._projectionLocation = (0, s3.throwIfFalsy)(o3.getUniformLocation(this._program, "u_projection")), this._resolutionLocation = (0, s3.throwIfFalsy)(o3.getUniformLocation(this._program, "u_resolution")), this._textureLocation = (0, s3.throwIfFalsy)(o3.getUniformLocation(this._program, "u_texture")), this._vertexArrayObject = o3.createVertexArray(), o3.bindVertexArray(this._vertexArrayObject);
            const h3 = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), c3 = o3.createBuffer();
            this.register((0, n2.toDisposable)((() => o3.deleteBuffer(c3)))), o3.bindBuffer(o3.ARRAY_BUFFER, c3), o3.bufferData(o3.ARRAY_BUFFER, h3, o3.STATIC_DRAW), o3.enableVertexAttribArray(0), o3.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 0, 0);
            const d3 = new Uint8Array([0, 1, 2, 3]), _3 = o3.createBuffer();
            this.register((0, n2.toDisposable)((() => o3.deleteBuffer(_3)))), o3.bindBuffer(o3.ELEMENT_ARRAY_BUFFER, _3), o3.bufferData(o3.ELEMENT_ARRAY_BUFFER, d3, o3.STATIC_DRAW), this._attributesBuffer = (0, s3.throwIfFalsy)(o3.createBuffer()), this.register((0, n2.toDisposable)((() => o3.deleteBuffer(this._attributesBuffer)))), o3.bindBuffer(o3.ARRAY_BUFFER, this._attributesBuffer), o3.enableVertexAttribArray(2), o3.vertexAttribPointer(2, 2, o3.FLOAT, false, l2, 0), o3.vertexAttribDivisor(2, 1), o3.enableVertexAttribArray(3), o3.vertexAttribPointer(3, 2, o3.FLOAT, false, l2, 2 * Float32Array.BYTES_PER_ELEMENT), o3.vertexAttribDivisor(3, 1), o3.enableVertexAttribArray(4), o3.vertexAttribPointer(4, 1, o3.FLOAT, false, l2, 4 * Float32Array.BYTES_PER_ELEMENT), o3.vertexAttribDivisor(4, 1), o3.enableVertexAttribArray(5), o3.vertexAttribPointer(5, 2, o3.FLOAT, false, l2, 5 * Float32Array.BYTES_PER_ELEMENT), o3.vertexAttribDivisor(5, 1), o3.enableVertexAttribArray(6), o3.vertexAttribPointer(6, 2, o3.FLOAT, false, l2, 7 * Float32Array.BYTES_PER_ELEMENT), o3.vertexAttribDivisor(6, 1), o3.enableVertexAttribArray(1), o3.vertexAttribPointer(1, 2, o3.FLOAT, false, l2, 9 * Float32Array.BYTES_PER_ELEMENT), o3.vertexAttribDivisor(1, 1), o3.useProgram(this._program);
            const u3 = new Int32Array(r2.TextureAtlas.maxAtlasPages);
            for (let e5 = 0; e5 < r2.TextureAtlas.maxAtlasPages; e5++) u3[e5] = e5;
            o3.uniform1iv(this._textureLocation, u3), o3.uniformMatrix4fv(this._projectionLocation, false, a2.PROJECTION_MATRIX), this._atlasTextures = [];
            for (let e5 = 0; e5 < r2.TextureAtlas.maxAtlasPages; e5++) {
              const t5 = new a2.GLTexture((0, s3.throwIfFalsy)(o3.createTexture()));
              this.register((0, n2.toDisposable)((() => o3.deleteTexture(t5.texture)))), o3.activeTexture(o3.TEXTURE0 + e5), o3.bindTexture(o3.TEXTURE_2D, t5.texture), o3.texParameteri(o3.TEXTURE_2D, o3.TEXTURE_WRAP_S, o3.CLAMP_TO_EDGE), o3.texParameteri(o3.TEXTURE_2D, o3.TEXTURE_WRAP_T, o3.CLAMP_TO_EDGE), o3.texImage2D(o3.TEXTURE_2D, 0, o3.RGBA, 1, 1, 0, o3.RGBA, o3.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255])), this._atlasTextures[e5] = t5;
            }
            o3.enable(o3.BLEND), o3.blendFunc(o3.SRC_ALPHA, o3.ONE_MINUS_SRC_ALPHA), this.handleResize();
          }
          beginFrame() {
            return !this._atlas || this._atlas.beginFrame();
          }
          updateCell(e4, t4, i4, s4, r3, o3, n3, a3) {
            this._updateCell(this._vertices.attributes, e4, t4, i4, s4, r3, o3, n3, a3);
          }
          _updateCell(e4, t4, i4, s4, r3, n3, a3, l3, g3) {
            d2 = (i4 * this._terminal.cols + t4) * h2, s4 !== o2.NULL_CELL_CODE && void 0 !== s4 ? this._atlas && (c2 = l3 && l3.length > 1 ? this._atlas.getRasterizedGlyphCombinedChar(l3, r3, n3, a3, false) : this._atlas.getRasterizedGlyph(s4, r3, n3, a3, false), _2 = Math.floor((this._dimensions.device.cell.width - this._dimensions.device.char.width) / 2), r3 !== g3 && c2.offset.x > _2 ? (u2 = c2.offset.x - _2, e4[d2] = -(c2.offset.x - u2) + this._dimensions.device.char.left, e4[d2 + 1] = -c2.offset.y + this._dimensions.device.char.top, e4[d2 + 2] = (c2.size.x - u2) / this._dimensions.device.canvas.width, e4[d2 + 3] = c2.size.y / this._dimensions.device.canvas.height, e4[d2 + 4] = c2.texturePage, e4[d2 + 5] = c2.texturePositionClipSpace.x + u2 / this._atlas.pages[c2.texturePage].canvas.width, e4[d2 + 6] = c2.texturePositionClipSpace.y, e4[d2 + 7] = c2.sizeClipSpace.x - u2 / this._atlas.pages[c2.texturePage].canvas.width, e4[d2 + 8] = c2.sizeClipSpace.y) : (e4[d2] = -c2.offset.x + this._dimensions.device.char.left, e4[d2 + 1] = -c2.offset.y + this._dimensions.device.char.top, e4[d2 + 2] = c2.size.x / this._dimensions.device.canvas.width, e4[d2 + 3] = c2.size.y / this._dimensions.device.canvas.height, e4[d2 + 4] = c2.texturePage, e4[d2 + 5] = c2.texturePositionClipSpace.x, e4[d2 + 6] = c2.texturePositionClipSpace.y, e4[d2 + 7] = c2.sizeClipSpace.x, e4[d2 + 8] = c2.sizeClipSpace.y)) : e4.fill(0, d2, d2 + h2 - 1 - 2);
          }
          clear() {
            const e4 = this._terminal, t4 = e4.cols * e4.rows * h2;
            this._vertices.count !== t4 ? this._vertices.attributes = new Float32Array(t4) : this._vertices.attributes.fill(0);
            let i4 = 0;
            for (; i4 < this._vertices.attributesBuffers.length; i4++) this._vertices.count !== t4 ? this._vertices.attributesBuffers[i4] = new Float32Array(t4) : this._vertices.attributesBuffers[i4].fill(0);
            this._vertices.count = t4, i4 = 0;
            for (let t5 = 0; t5 < e4.rows; t5++) for (let s4 = 0; s4 < e4.cols; s4++) this._vertices.attributes[i4 + 9] = s4 / e4.cols, this._vertices.attributes[i4 + 10] = t5 / e4.rows, i4 += h2;
          }
          handleResize() {
            const e4 = this._gl;
            e4.useProgram(this._program), e4.viewport(0, 0, e4.canvas.width, e4.canvas.height), e4.uniform2f(this._resolutionLocation, e4.canvas.width, e4.canvas.height), this.clear();
          }
          render(e4) {
            if (!this._atlas) return;
            const t4 = this._gl;
            t4.useProgram(this._program), t4.bindVertexArray(this._vertexArrayObject), this._activeBuffer = (this._activeBuffer + 1) % 2;
            const i4 = this._vertices.attributesBuffers[this._activeBuffer];
            let s4 = 0;
            for (let t5 = 0; t5 < e4.lineLengths.length; t5++) {
              const r3 = t5 * this._terminal.cols * h2, o3 = this._vertices.attributes.subarray(r3, r3 + e4.lineLengths[t5] * h2);
              i4.set(o3, s4), s4 += o3.length;
            }
            t4.bindBuffer(t4.ARRAY_BUFFER, this._attributesBuffer), t4.bufferData(t4.ARRAY_BUFFER, i4.subarray(0, s4), t4.STREAM_DRAW);
            for (let e5 = 0; e5 < this._atlas.pages.length; e5++) this._atlas.pages[e5].version !== this._atlasTextures[e5].version && this._bindAtlasPageTexture(t4, this._atlas, e5);
            t4.drawElementsInstanced(t4.TRIANGLE_STRIP, 4, t4.UNSIGNED_BYTE, 0, s4 / h2);
          }
          setAtlas(e4) {
            this._atlas = e4;
            for (const e5 of this._atlasTextures) e5.version = -1;
          }
          _bindAtlasPageTexture(e4, t4, i4) {
            e4.activeTexture(e4.TEXTURE0 + i4), e4.bindTexture(e4.TEXTURE_2D, this._atlasTextures[i4].texture), e4.texParameteri(e4.TEXTURE_2D, e4.TEXTURE_WRAP_S, e4.CLAMP_TO_EDGE), e4.texParameteri(e4.TEXTURE_2D, e4.TEXTURE_WRAP_T, e4.CLAMP_TO_EDGE), e4.texImage2D(e4.TEXTURE_2D, 0, e4.RGBA, e4.RGBA, e4.UNSIGNED_BYTE, t4.pages[i4].canvas), e4.generateMipmap(e4.TEXTURE_2D), this._atlasTextures[i4].version = t4.pages[i4].version;
          }
          setDimensions(e4) {
            this._dimensions = e4;
          }
        }
        t3.GlyphRenderer = g2;
      }, 742: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.RectangleRenderer = void 0;
        const s3 = i3(374), r2 = i3(859), o2 = i3(310), n2 = i3(381), a2 = 8 * Float32Array.BYTES_PER_ELEMENT;
        class h2 {
          constructor() {
            this.attributes = new Float32Array(160), this.count = 0;
          }
        }
        let l2 = 0, c2 = 0, d2 = 0, _2 = 0, u2 = 0, g2 = 0, v2 = 0;
        class f2 extends r2.Disposable {
          constructor(e4, t4, i4, o3) {
            super(), this._terminal = e4, this._gl = t4, this._dimensions = i4, this._themeService = o3, this._vertices = new h2(), this._verticesCursor = new h2();
            const l3 = this._gl;
            this._program = (0, s3.throwIfFalsy)((0, n2.createProgram)(l3, "#version 300 es\nlayout (location = 0) in vec2 a_position;\nlayout (location = 1) in vec2 a_size;\nlayout (location = 2) in vec4 a_color;\nlayout (location = 3) in vec2 a_unitquad;\n\nuniform mat4 u_projection;\n\nout vec4 v_color;\n\nvoid main() {\n  vec2 zeroToOne = a_position + (a_unitquad * a_size);\n  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);\n  v_color = a_color;\n}", "#version 300 es\nprecision lowp float;\n\nin vec4 v_color;\n\nout vec4 outColor;\n\nvoid main() {\n  outColor = v_color;\n}")), this.register((0, r2.toDisposable)((() => l3.deleteProgram(this._program)))), this._projectionLocation = (0, s3.throwIfFalsy)(l3.getUniformLocation(this._program, "u_projection")), this._vertexArrayObject = l3.createVertexArray(), l3.bindVertexArray(this._vertexArrayObject);
            const c3 = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), d3 = l3.createBuffer();
            this.register((0, r2.toDisposable)((() => l3.deleteBuffer(d3)))), l3.bindBuffer(l3.ARRAY_BUFFER, d3), l3.bufferData(l3.ARRAY_BUFFER, c3, l3.STATIC_DRAW), l3.enableVertexAttribArray(3), l3.vertexAttribPointer(3, 2, this._gl.FLOAT, false, 0, 0);
            const _3 = new Uint8Array([0, 1, 2, 3]), u3 = l3.createBuffer();
            this.register((0, r2.toDisposable)((() => l3.deleteBuffer(u3)))), l3.bindBuffer(l3.ELEMENT_ARRAY_BUFFER, u3), l3.bufferData(l3.ELEMENT_ARRAY_BUFFER, _3, l3.STATIC_DRAW), this._attributesBuffer = (0, s3.throwIfFalsy)(l3.createBuffer()), this.register((0, r2.toDisposable)((() => l3.deleteBuffer(this._attributesBuffer)))), l3.bindBuffer(l3.ARRAY_BUFFER, this._attributesBuffer), l3.enableVertexAttribArray(0), l3.vertexAttribPointer(0, 2, l3.FLOAT, false, a2, 0), l3.vertexAttribDivisor(0, 1), l3.enableVertexAttribArray(1), l3.vertexAttribPointer(1, 2, l3.FLOAT, false, a2, 2 * Float32Array.BYTES_PER_ELEMENT), l3.vertexAttribDivisor(1, 1), l3.enableVertexAttribArray(2), l3.vertexAttribPointer(2, 4, l3.FLOAT, false, a2, 4 * Float32Array.BYTES_PER_ELEMENT), l3.vertexAttribDivisor(2, 1), this._updateCachedColors(o3.colors), this.register(this._themeService.onChangeColors(((e5) => {
              this._updateCachedColors(e5), this._updateViewportRectangle();
            })));
          }
          renderBackgrounds() {
            this._renderVertices(this._vertices);
          }
          renderCursor() {
            this._renderVertices(this._verticesCursor);
          }
          _renderVertices(e4) {
            const t4 = this._gl;
            t4.useProgram(this._program), t4.bindVertexArray(this._vertexArrayObject), t4.uniformMatrix4fv(this._projectionLocation, false, n2.PROJECTION_MATRIX), t4.bindBuffer(t4.ARRAY_BUFFER, this._attributesBuffer), t4.bufferData(t4.ARRAY_BUFFER, e4.attributes, t4.DYNAMIC_DRAW), t4.drawElementsInstanced(this._gl.TRIANGLE_STRIP, 4, t4.UNSIGNED_BYTE, 0, e4.count);
          }
          handleResize() {
            this._updateViewportRectangle();
          }
          setDimensions(e4) {
            this._dimensions = e4;
          }
          _updateCachedColors(e4) {
            this._bgFloat = this._colorToFloat32Array(e4.background), this._cursorFloat = this._colorToFloat32Array(e4.cursor);
          }
          _updateViewportRectangle() {
            this._addRectangleFloat(this._vertices.attributes, 0, 0, 0, this._terminal.cols * this._dimensions.device.cell.width, this._terminal.rows * this._dimensions.device.cell.height, this._bgFloat);
          }
          updateBackgrounds(e4) {
            const t4 = this._terminal, i4 = this._vertices;
            let s4, r3, n3, a3, h3, l3, c3, d3, _3, u3, g3, v3 = 1;
            for (s4 = 0; s4 < t4.rows; s4++) {
              for (n3 = -1, a3 = 0, h3 = 0, l3 = false, r3 = 0; r3 < t4.cols; r3++) c3 = (s4 * t4.cols + r3) * o2.RENDER_MODEL_INDICIES_PER_CELL, d3 = e4.cells[c3 + o2.RENDER_MODEL_BG_OFFSET], _3 = e4.cells[c3 + o2.RENDER_MODEL_FG_OFFSET], u3 = !!(67108864 & _3), (d3 !== a3 || _3 !== h3 && (l3 || u3)) && ((0 !== a3 || l3 && 0 !== h3) && (g3 = 8 * v3++, this._updateRectangle(i4, g3, h3, a3, n3, r3, s4)), n3 = r3, a3 = d3, h3 = _3, l3 = u3);
              (0 !== a3 || l3 && 0 !== h3) && (g3 = 8 * v3++, this._updateRectangle(i4, g3, h3, a3, n3, t4.cols, s4));
            }
            i4.count = v3;
          }
          updateCursor(e4) {
            const t4 = this._verticesCursor, i4 = e4.cursor;
            if (!i4 || "block" === i4.style) return void (t4.count = 0);
            let s4, r3 = 0;
            "bar" !== i4.style && "outline" !== i4.style || (s4 = 8 * r3++, this._addRectangleFloat(t4.attributes, s4, i4.x * this._dimensions.device.cell.width, i4.y * this._dimensions.device.cell.height, "bar" === i4.style ? i4.dpr * i4.cursorWidth : i4.dpr, this._dimensions.device.cell.height, this._cursorFloat)), "underline" !== i4.style && "outline" !== i4.style || (s4 = 8 * r3++, this._addRectangleFloat(t4.attributes, s4, i4.x * this._dimensions.device.cell.width, (i4.y + 1) * this._dimensions.device.cell.height - i4.dpr, i4.width * this._dimensions.device.cell.width, i4.dpr, this._cursorFloat)), "outline" === i4.style && (s4 = 8 * r3++, this._addRectangleFloat(t4.attributes, s4, i4.x * this._dimensions.device.cell.width, i4.y * this._dimensions.device.cell.height, i4.width * this._dimensions.device.cell.width, i4.dpr, this._cursorFloat), s4 = 8 * r3++, this._addRectangleFloat(t4.attributes, s4, (i4.x + i4.width) * this._dimensions.device.cell.width - i4.dpr, i4.y * this._dimensions.device.cell.height, i4.dpr, this._dimensions.device.cell.height, this._cursorFloat)), t4.count = r3;
          }
          _updateRectangle(e4, t4, i4, s4, r3, o3, a3) {
            if (67108864 & i4) switch (50331648 & i4) {
              case 16777216:
              case 33554432:
                l2 = this._themeService.colors.ansi[255 & i4].rgba;
                break;
              case 50331648:
                l2 = (16777215 & i4) << 8;
                break;
              default:
                l2 = this._themeService.colors.foreground.rgba;
            }
            else switch (50331648 & s4) {
              case 16777216:
              case 33554432:
                l2 = this._themeService.colors.ansi[255 & s4].rgba;
                break;
              case 50331648:
                l2 = (16777215 & s4) << 8;
                break;
              default:
                l2 = this._themeService.colors.background.rgba;
            }
            e4.attributes.length < t4 + 4 && (e4.attributes = (0, n2.expandFloat32Array)(e4.attributes, this._terminal.rows * this._terminal.cols * 8)), c2 = r3 * this._dimensions.device.cell.width, d2 = a3 * this._dimensions.device.cell.height, _2 = (l2 >> 24 & 255) / 255, u2 = (l2 >> 16 & 255) / 255, g2 = (l2 >> 8 & 255) / 255, v2 = 1, this._addRectangle(e4.attributes, t4, c2, d2, (o3 - r3) * this._dimensions.device.cell.width, this._dimensions.device.cell.height, _2, u2, g2, v2);
          }
          _addRectangle(e4, t4, i4, s4, r3, o3, n3, a3, h3, l3) {
            e4[t4] = i4 / this._dimensions.device.canvas.width, e4[t4 + 1] = s4 / this._dimensions.device.canvas.height, e4[t4 + 2] = r3 / this._dimensions.device.canvas.width, e4[t4 + 3] = o3 / this._dimensions.device.canvas.height, e4[t4 + 4] = n3, e4[t4 + 5] = a3, e4[t4 + 6] = h3, e4[t4 + 7] = l3;
          }
          _addRectangleFloat(e4, t4, i4, s4, r3, o3, n3) {
            e4[t4] = i4 / this._dimensions.device.canvas.width, e4[t4 + 1] = s4 / this._dimensions.device.canvas.height, e4[t4 + 2] = r3 / this._dimensions.device.canvas.width, e4[t4 + 3] = o3 / this._dimensions.device.canvas.height, e4[t4 + 4] = n3[0], e4[t4 + 5] = n3[1], e4[t4 + 6] = n3[2], e4[t4 + 7] = n3[3];
          }
          _colorToFloat32Array(e4) {
            return new Float32Array([(e4.rgba >> 24 & 255) / 255, (e4.rgba >> 16 & 255) / 255, (e4.rgba >> 8 & 255) / 255, (255 & e4.rgba) / 255]);
          }
        }
        t3.RectangleRenderer = f2;
      }, 310: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.RenderModel = t3.COMBINED_CHAR_BIT_MASK = t3.RENDER_MODEL_EXT_OFFSET = t3.RENDER_MODEL_FG_OFFSET = t3.RENDER_MODEL_BG_OFFSET = t3.RENDER_MODEL_INDICIES_PER_CELL = void 0;
        const s3 = i3(296);
        t3.RENDER_MODEL_INDICIES_PER_CELL = 4, t3.RENDER_MODEL_BG_OFFSET = 1, t3.RENDER_MODEL_FG_OFFSET = 2, t3.RENDER_MODEL_EXT_OFFSET = 3, t3.COMBINED_CHAR_BIT_MASK = 2147483648, t3.RenderModel = class {
          constructor() {
            this.cells = new Uint32Array(0), this.lineLengths = new Uint32Array(0), this.selection = (0, s3.createSelectionRenderModel)();
          }
          resize(e4, i4) {
            const s4 = e4 * i4 * t3.RENDER_MODEL_INDICIES_PER_CELL;
            s4 !== this.cells.length && (this.cells = new Uint32Array(s4), this.lineLengths = new Uint32Array(i4));
          }
          clear() {
            this.cells.fill(0, 0), this.lineLengths.fill(0, 0);
          }
        };
      }, 666: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.JoinedCellData = t3.WebglRenderer = void 0;
        const s3 = i3(820), r2 = i3(274), o2 = i3(627), n2 = i3(457), a2 = i3(56), h2 = i3(374), l2 = i3(345), c2 = i3(859), d2 = i3(147), _2 = i3(782), u2 = i3(855), g2 = i3(965), v2 = i3(742), f2 = i3(310), p2 = i3(733);
        class C2 extends c2.Disposable {
          constructor(e4, t4, i4, n3, d3, u3, g3, v3, C3) {
            super(), this._terminal = e4, this._characterJoinerService = t4, this._charSizeService = i4, this._coreBrowserService = n3, this._coreService = d3, this._decorationService = u3, this._optionsService = g3, this._themeService = v3, this._cursorBlinkStateManager = new c2.MutableDisposable(), this._charAtlasDisposable = this.register(new c2.MutableDisposable()), this._observerDisposable = this.register(new c2.MutableDisposable()), this._model = new f2.RenderModel(), this._workCell = new _2.CellData(), this._rectangleRenderer = this.register(new c2.MutableDisposable()), this._glyphRenderer = this.register(new c2.MutableDisposable()), this._onChangeTextureAtlas = this.register(new l2.EventEmitter()), this.onChangeTextureAtlas = this._onChangeTextureAtlas.event, this._onAddTextureAtlasCanvas = this.register(new l2.EventEmitter()), this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event, this._onRemoveTextureAtlasCanvas = this.register(new l2.EventEmitter()), this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event, this._onRequestRedraw = this.register(new l2.EventEmitter()), this.onRequestRedraw = this._onRequestRedraw.event, this._onContextLoss = this.register(new l2.EventEmitter()), this.onContextLoss = this._onContextLoss.event, this.register(this._themeService.onChangeColors((() => this._handleColorChange()))), this._cellColorResolver = new r2.CellColorResolver(this._terminal, this._optionsService, this._model.selection, this._decorationService, this._coreBrowserService, this._themeService), this._core = this._terminal._core, this._renderLayers = [new p2.LinkRenderLayer(this._core.screenElement, 2, this._terminal, this._core.linkifier, this._coreBrowserService, g3, this._themeService)], this.dimensions = (0, h2.createRenderDimensions)(), this._devicePixelRatio = this._coreBrowserService.dpr, this._updateDimensions(), this._updateCursorBlink(), this.register(g3.onOptionChange((() => this._handleOptionsChanged()))), this._canvas = this._coreBrowserService.mainDocument.createElement("canvas");
            const m3 = { antialias: false, depth: false, preserveDrawingBuffer: C3 };
            if (this._gl = this._canvas.getContext("webgl2", m3), !this._gl) throw new Error("WebGL2 not supported " + this._gl);
            this.register((0, s3.addDisposableDomListener)(this._canvas, "webglcontextlost", ((e5) => {
              console.log("webglcontextlost event received"), e5.preventDefault(), this._contextRestorationTimeout = setTimeout((() => {
                this._contextRestorationTimeout = void 0, console.warn("webgl context not restored; firing onContextLoss"), this._onContextLoss.fire(e5);
              }), 3e3);
            }))), this.register((0, s3.addDisposableDomListener)(this._canvas, "webglcontextrestored", ((e5) => {
              console.warn("webglcontextrestored event received"), clearTimeout(this._contextRestorationTimeout), this._contextRestorationTimeout = void 0, (0, o2.removeTerminalFromCache)(this._terminal), this._initializeWebGLState(), this._requestRedrawViewport();
            }))), this._observerDisposable.value = (0, a2.observeDevicePixelDimensions)(this._canvas, this._coreBrowserService.window, ((e5, t5) => this._setCanvasDevicePixelDimensions(e5, t5))), this.register(this._coreBrowserService.onWindowChange(((e5) => {
              this._observerDisposable.value = (0, a2.observeDevicePixelDimensions)(this._canvas, e5, ((e6, t5) => this._setCanvasDevicePixelDimensions(e6, t5)));
            }))), this._core.screenElement.appendChild(this._canvas), [this._rectangleRenderer.value, this._glyphRenderer.value] = this._initializeWebGLState(), this._isAttached = this._coreBrowserService.window.document.body.contains(this._core.screenElement), this.register((0, c2.toDisposable)((() => {
              for (const e5 of this._renderLayers) e5.dispose();
              this._canvas.parentElement?.removeChild(this._canvas), (0, o2.removeTerminalFromCache)(this._terminal);
            })));
          }
          get textureAtlas() {
            return this._charAtlas?.pages[0].canvas;
          }
          _handleColorChange() {
            this._refreshCharAtlas(), this._clearModel(true);
          }
          handleDevicePixelRatioChange() {
            this._devicePixelRatio !== this._coreBrowserService.dpr && (this._devicePixelRatio = this._coreBrowserService.dpr, this.handleResize(this._terminal.cols, this._terminal.rows));
          }
          handleResize(e4, t4) {
            this._updateDimensions(), this._model.resize(this._terminal.cols, this._terminal.rows);
            for (const e5 of this._renderLayers) e5.resize(this._terminal, this.dimensions);
            this._canvas.width = this.dimensions.device.canvas.width, this._canvas.height = this.dimensions.device.canvas.height, this._canvas.style.width = `${this.dimensions.css.canvas.width}px`, this._canvas.style.height = `${this.dimensions.css.canvas.height}px`, this._core.screenElement.style.width = `${this.dimensions.css.canvas.width}px`, this._core.screenElement.style.height = `${this.dimensions.css.canvas.height}px`, this._rectangleRenderer.value?.setDimensions(this.dimensions), this._rectangleRenderer.value?.handleResize(), this._glyphRenderer.value?.setDimensions(this.dimensions), this._glyphRenderer.value?.handleResize(), this._refreshCharAtlas(), this._clearModel(false);
          }
          handleCharSizeChanged() {
            this.handleResize(this._terminal.cols, this._terminal.rows);
          }
          handleBlur() {
            for (const e4 of this._renderLayers) e4.handleBlur(this._terminal);
            this._cursorBlinkStateManager.value?.pause(), this._requestRedrawViewport();
          }
          handleFocus() {
            for (const e4 of this._renderLayers) e4.handleFocus(this._terminal);
            this._cursorBlinkStateManager.value?.resume(), this._requestRedrawViewport();
          }
          handleSelectionChanged(e4, t4, i4) {
            for (const s4 of this._renderLayers) s4.handleSelectionChanged(this._terminal, e4, t4, i4);
            this._model.selection.update(this._core, e4, t4, i4), this._requestRedrawViewport();
          }
          handleCursorMove() {
            for (const e4 of this._renderLayers) e4.handleCursorMove(this._terminal);
            this._cursorBlinkStateManager.value?.restartBlinkAnimation();
          }
          _handleOptionsChanged() {
            this._updateDimensions(), this._refreshCharAtlas(), this._updateCursorBlink();
          }
          _initializeWebGLState() {
            return this._rectangleRenderer.value = new v2.RectangleRenderer(this._terminal, this._gl, this.dimensions, this._themeService), this._glyphRenderer.value = new g2.GlyphRenderer(this._terminal, this._gl, this.dimensions), this.handleCharSizeChanged(), [this._rectangleRenderer.value, this._glyphRenderer.value];
          }
          _refreshCharAtlas() {
            if (this.dimensions.device.char.width <= 0 && this.dimensions.device.char.height <= 0) return void (this._isAttached = false);
            const e4 = (0, o2.acquireTextureAtlas)(this._terminal, this._optionsService.rawOptions, this._themeService.colors, this.dimensions.device.cell.width, this.dimensions.device.cell.height, this.dimensions.device.char.width, this.dimensions.device.char.height, this._coreBrowserService.dpr);
            this._charAtlas !== e4 && (this._onChangeTextureAtlas.fire(e4.pages[0].canvas), this._charAtlasDisposable.value = (0, c2.getDisposeArrayDisposable)([(0, l2.forwardEvent)(e4.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas), (0, l2.forwardEvent)(e4.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas)])), this._charAtlas = e4, this._charAtlas.warmUp(), this._glyphRenderer.value?.setAtlas(this._charAtlas);
          }
          _clearModel(e4) {
            this._model.clear(), e4 && this._glyphRenderer.value?.clear();
          }
          clearTextureAtlas() {
            this._charAtlas?.clearTexture(), this._clearModel(true), this._requestRedrawViewport();
          }
          clear() {
            this._clearModel(true);
            for (const e4 of this._renderLayers) e4.reset(this._terminal);
            this._cursorBlinkStateManager.value?.restartBlinkAnimation(), this._updateCursorBlink();
          }
          registerCharacterJoiner(e4) {
            return -1;
          }
          deregisterCharacterJoiner(e4) {
            return false;
          }
          renderRows(e4, t4) {
            if (!this._isAttached) {
              if (!(this._coreBrowserService.window.document.body.contains(this._core.screenElement) && this._charSizeService.width && this._charSizeService.height)) return;
              this._updateDimensions(), this._refreshCharAtlas(), this._isAttached = true;
            }
            for (const i4 of this._renderLayers) i4.handleGridChanged(this._terminal, e4, t4);
            this._glyphRenderer.value && this._rectangleRenderer.value && (this._glyphRenderer.value.beginFrame() ? (this._clearModel(true), this._updateModel(0, this._terminal.rows - 1)) : this._updateModel(e4, t4), this._rectangleRenderer.value.renderBackgrounds(), this._glyphRenderer.value.render(this._model), this._cursorBlinkStateManager.value && !this._cursorBlinkStateManager.value.isCursorVisible || this._rectangleRenderer.value.renderCursor());
          }
          _updateCursorBlink() {
            this._terminal.options.cursorBlink ? this._cursorBlinkStateManager.value = new n2.CursorBlinkStateManager((() => {
              this._requestRedrawCursor();
            }), this._coreBrowserService) : this._cursorBlinkStateManager.clear(), this._requestRedrawCursor();
          }
          _updateModel(e4, t4) {
            const i4 = this._core;
            let s4, r3, o3, n3, a3, h3, l3, c3, d3, _3, g3, v3, p3, C3 = this._workCell;
            e4 = L2(e4, i4.rows - 1, 0), t4 = L2(t4, i4.rows - 1, 0);
            const x2 = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY, w2 = x2 - i4.buffer.ydisp, b2 = Math.min(this._terminal.buffer.active.cursorX, i4.cols - 1);
            let M2 = -1;
            const R2 = this._coreService.isCursorInitialized && !this._coreService.isCursorHidden && (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible);
            this._model.cursor = void 0;
            let y2 = false;
            for (r3 = e4; r3 <= t4; r3++) for (o3 = r3 + i4.buffer.ydisp, n3 = i4.buffer.lines.get(o3), this._model.lineLengths[r3] = 0, a3 = this._characterJoinerService.getJoinedCharacters(o3), v3 = 0; v3 < i4.cols; v3++) if (s4 = this._cellColorResolver.result.bg, n3.loadCell(v3, C3), 0 === v3 && (s4 = this._cellColorResolver.result.bg), h3 = false, l3 = v3, a3.length > 0 && v3 === a3[0][0] && (h3 = true, c3 = a3.shift(), C3 = new m2(C3, n3.translateToString(true, c3[0], c3[1]), c3[1] - c3[0]), l3 = c3[1] - 1), d3 = C3.getChars(), _3 = C3.getCode(), g3 = (r3 * i4.cols + v3) * f2.RENDER_MODEL_INDICIES_PER_CELL, this._cellColorResolver.resolve(C3, v3, o3, this.dimensions.device.cell.width), R2 && o3 === x2 && (v3 === b2 && (this._model.cursor = { x: b2, y: w2, width: C3.getWidth(), style: this._coreBrowserService.isFocused ? i4.options.cursorStyle || "block" : i4.options.cursorInactiveStyle, cursorWidth: i4.options.cursorWidth, dpr: this._devicePixelRatio }, M2 = b2 + C3.getWidth() - 1), v3 >= b2 && v3 <= M2 && (this._coreBrowserService.isFocused && "block" === (i4.options.cursorStyle || "block") || false === this._coreBrowserService.isFocused && "block" === i4.options.cursorInactiveStyle) && (this._cellColorResolver.result.fg = 50331648 | this._themeService.colors.cursorAccent.rgba >> 8 & 16777215, this._cellColorResolver.result.bg = 50331648 | this._themeService.colors.cursor.rgba >> 8 & 16777215)), _3 !== u2.NULL_CELL_CODE && (this._model.lineLengths[r3] = v3 + 1), (this._model.cells[g3] !== _3 || this._model.cells[g3 + f2.RENDER_MODEL_BG_OFFSET] !== this._cellColorResolver.result.bg || this._model.cells[g3 + f2.RENDER_MODEL_FG_OFFSET] !== this._cellColorResolver.result.fg || this._model.cells[g3 + f2.RENDER_MODEL_EXT_OFFSET] !== this._cellColorResolver.result.ext) && (y2 = true, d3.length > 1 && (_3 |= f2.COMBINED_CHAR_BIT_MASK), this._model.cells[g3] = _3, this._model.cells[g3 + f2.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg, this._model.cells[g3 + f2.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg, this._model.cells[g3 + f2.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext, this._glyphRenderer.value.updateCell(v3, r3, _3, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, d3, s4), h3)) for (C3 = this._workCell, v3++; v3 < l3; v3++) p3 = (r3 * i4.cols + v3) * f2.RENDER_MODEL_INDICIES_PER_CELL, this._glyphRenderer.value.updateCell(v3, r3, u2.NULL_CELL_CODE, 0, 0, 0, u2.NULL_CELL_CHAR, 0), this._model.cells[p3] = u2.NULL_CELL_CODE, this._model.cells[p3 + f2.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg, this._model.cells[p3 + f2.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg, this._model.cells[p3 + f2.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext;
            y2 && this._rectangleRenderer.value.updateBackgrounds(this._model), this._rectangleRenderer.value.updateCursor(this._model);
          }
          _updateDimensions() {
            this._charSizeService.width && this._charSizeService.height && (this.dimensions.device.char.width = Math.floor(this._charSizeService.width * this._devicePixelRatio), this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * this._devicePixelRatio), this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight), this.dimensions.device.char.top = 1 === this._optionsService.rawOptions.lineHeight ? 0 : Math.round((this.dimensions.device.cell.height - this.dimensions.device.char.height) / 2), this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing), this.dimensions.device.char.left = Math.floor(this._optionsService.rawOptions.letterSpacing / 2), this.dimensions.device.canvas.height = this._terminal.rows * this.dimensions.device.cell.height, this.dimensions.device.canvas.width = this._terminal.cols * this.dimensions.device.cell.width, this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / this._devicePixelRatio), this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / this._devicePixelRatio), this.dimensions.css.cell.height = this.dimensions.device.cell.height / this._devicePixelRatio, this.dimensions.css.cell.width = this.dimensions.device.cell.width / this._devicePixelRatio);
          }
          _setCanvasDevicePixelDimensions(e4, t4) {
            this._canvas.width === e4 && this._canvas.height === t4 || (this._canvas.width = e4, this._canvas.height = t4, this._requestRedrawViewport());
          }
          _requestRedrawViewport() {
            this._onRequestRedraw.fire({ start: 0, end: this._terminal.rows - 1 });
          }
          _requestRedrawCursor() {
            const e4 = this._terminal.buffer.active.cursorY;
            this._onRequestRedraw.fire({ start: e4, end: e4 });
          }
        }
        t3.WebglRenderer = C2;
        class m2 extends d2.AttributeData {
          constructor(e4, t4, i4) {
            super(), this.content = 0, this.combinedData = "", this.fg = e4.fg, this.bg = e4.bg, this.combinedData = t4, this._width = i4;
          }
          isCombined() {
            return 2097152;
          }
          getWidth() {
            return this._width;
          }
          getChars() {
            return this.combinedData;
          }
          getCode() {
            return 2097151;
          }
          setFromCharData(e4) {
            throw new Error("not implemented");
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        function L2(e4, t4, i4 = 0) {
          return Math.max(Math.min(e4, t4), i4);
        }
        t3.JoinedCellData = m2;
      }, 381: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.GLTexture = t3.expandFloat32Array = t3.createShader = t3.createProgram = t3.PROJECTION_MATRIX = void 0;
        const s3 = i3(374);
        function r2(e4, t4, i4) {
          const r3 = (0, s3.throwIfFalsy)(e4.createShader(t4));
          if (e4.shaderSource(r3, i4), e4.compileShader(r3), e4.getShaderParameter(r3, e4.COMPILE_STATUS)) return r3;
          console.error(e4.getShaderInfoLog(r3)), e4.deleteShader(r3);
        }
        t3.PROJECTION_MATRIX = new Float32Array([2, 0, 0, 0, 0, -2, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1]), t3.createProgram = function(e4, t4, i4) {
          const o2 = (0, s3.throwIfFalsy)(e4.createProgram());
          if (e4.attachShader(o2, (0, s3.throwIfFalsy)(r2(e4, e4.VERTEX_SHADER, t4))), e4.attachShader(o2, (0, s3.throwIfFalsy)(r2(e4, e4.FRAGMENT_SHADER, i4))), e4.linkProgram(o2), e4.getProgramParameter(o2, e4.LINK_STATUS)) return o2;
          console.error(e4.getProgramInfoLog(o2)), e4.deleteProgram(o2);
        }, t3.createShader = r2, t3.expandFloat32Array = function(e4, t4) {
          const i4 = Math.min(2 * e4.length, t4), s4 = new Float32Array(i4);
          for (let t5 = 0; t5 < e4.length; t5++) s4[t5] = e4[t5];
          return s4;
        }, t3.GLTexture = class {
          constructor(e4) {
            this.texture = e4, this.version = -1;
          }
        };
      }, 592: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.BaseRenderLayer = void 0;
        const s3 = i3(627), r2 = i3(237), o2 = i3(374), n2 = i3(859);
        class a2 extends n2.Disposable {
          constructor(e4, t4, i4, s4, r3, o3, a3, h2) {
            super(), this._container = t4, this._alpha = r3, this._coreBrowserService = o3, this._optionsService = a3, this._themeService = h2, this._deviceCharWidth = 0, this._deviceCharHeight = 0, this._deviceCellWidth = 0, this._deviceCellHeight = 0, this._deviceCharLeft = 0, this._deviceCharTop = 0, this._canvas = this._coreBrowserService.mainDocument.createElement("canvas"), this._canvas.classList.add(`xterm-${i4}-layer`), this._canvas.style.zIndex = s4.toString(), this._initCanvas(), this._container.appendChild(this._canvas), this.register(this._themeService.onChangeColors(((t5) => {
              this._refreshCharAtlas(e4, t5), this.reset(e4);
            }))), this.register((0, n2.toDisposable)((() => {
              this._canvas.remove();
            })));
          }
          _initCanvas() {
            this._ctx = (0, o2.throwIfFalsy)(this._canvas.getContext("2d", { alpha: this._alpha })), this._alpha || this._clearAll();
          }
          handleBlur(e4) {
          }
          handleFocus(e4) {
          }
          handleCursorMove(e4) {
          }
          handleGridChanged(e4, t4, i4) {
          }
          handleSelectionChanged(e4, t4, i4, s4 = false) {
          }
          _setTransparency(e4, t4) {
            if (t4 === this._alpha) return;
            const i4 = this._canvas;
            this._alpha = t4, this._canvas = this._canvas.cloneNode(), this._initCanvas(), this._container.replaceChild(this._canvas, i4), this._refreshCharAtlas(e4, this._themeService.colors), this.handleGridChanged(e4, 0, e4.rows - 1);
          }
          _refreshCharAtlas(e4, t4) {
            this._deviceCharWidth <= 0 && this._deviceCharHeight <= 0 || (this._charAtlas = (0, s3.acquireTextureAtlas)(e4, this._optionsService.rawOptions, t4, this._deviceCellWidth, this._deviceCellHeight, this._deviceCharWidth, this._deviceCharHeight, this._coreBrowserService.dpr), this._charAtlas.warmUp());
          }
          resize(e4, t4) {
            this._deviceCellWidth = t4.device.cell.width, this._deviceCellHeight = t4.device.cell.height, this._deviceCharWidth = t4.device.char.width, this._deviceCharHeight = t4.device.char.height, this._deviceCharLeft = t4.device.char.left, this._deviceCharTop = t4.device.char.top, this._canvas.width = t4.device.canvas.width, this._canvas.height = t4.device.canvas.height, this._canvas.style.width = `${t4.css.canvas.width}px`, this._canvas.style.height = `${t4.css.canvas.height}px`, this._alpha || this._clearAll(), this._refreshCharAtlas(e4, this._themeService.colors);
          }
          _fillBottomLineAtCells(e4, t4, i4 = 1) {
            this._ctx.fillRect(e4 * this._deviceCellWidth, (t4 + 1) * this._deviceCellHeight - this._coreBrowserService.dpr - 1, i4 * this._deviceCellWidth, this._coreBrowserService.dpr);
          }
          _clearAll() {
            this._alpha ? this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height) : (this._ctx.fillStyle = this._themeService.colors.background.css, this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height));
          }
          _clearCells(e4, t4, i4, s4) {
            this._alpha ? this._ctx.clearRect(e4 * this._deviceCellWidth, t4 * this._deviceCellHeight, i4 * this._deviceCellWidth, s4 * this._deviceCellHeight) : (this._ctx.fillStyle = this._themeService.colors.background.css, this._ctx.fillRect(e4 * this._deviceCellWidth, t4 * this._deviceCellHeight, i4 * this._deviceCellWidth, s4 * this._deviceCellHeight));
          }
          _fillCharTrueColor(e4, t4, i4, s4) {
            this._ctx.font = this._getFont(e4, false, false), this._ctx.textBaseline = r2.TEXT_BASELINE, this._clipCell(i4, s4, t4.getWidth()), this._ctx.fillText(t4.getChars(), i4 * this._deviceCellWidth + this._deviceCharLeft, s4 * this._deviceCellHeight + this._deviceCharTop + this._deviceCharHeight);
          }
          _clipCell(e4, t4, i4) {
            this._ctx.beginPath(), this._ctx.rect(e4 * this._deviceCellWidth, t4 * this._deviceCellHeight, i4 * this._deviceCellWidth, this._deviceCellHeight), this._ctx.clip();
          }
          _getFont(e4, t4, i4) {
            return `${i4 ? "italic" : ""} ${t4 ? e4.options.fontWeightBold : e4.options.fontWeight} ${e4.options.fontSize * this._coreBrowserService.dpr}px ${e4.options.fontFamily}`;
          }
        }
        t3.BaseRenderLayer = a2;
      }, 733: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.LinkRenderLayer = void 0;
        const s3 = i3(197), r2 = i3(237), o2 = i3(592);
        class n2 extends o2.BaseRenderLayer {
          constructor(e4, t4, i4, s4, r3, o3, n3) {
            super(i4, e4, "link", t4, true, r3, o3, n3), this.register(s4.onShowLinkUnderline(((e5) => this._handleShowLinkUnderline(e5)))), this.register(s4.onHideLinkUnderline(((e5) => this._handleHideLinkUnderline(e5))));
          }
          resize(e4, t4) {
            super.resize(e4, t4), this._state = void 0;
          }
          reset(e4) {
            this._clearCurrentLink();
          }
          _clearCurrentLink() {
            if (this._state) {
              this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
              const e4 = this._state.y2 - this._state.y1 - 1;
              e4 > 0 && this._clearCells(0, this._state.y1 + 1, this._state.cols, e4), this._clearCells(0, this._state.y2, this._state.x2, 1), this._state = void 0;
            }
          }
          _handleShowLinkUnderline(e4) {
            if (e4.fg === r2.INVERTED_DEFAULT_COLOR ? this._ctx.fillStyle = this._themeService.colors.background.css : void 0 !== e4.fg && (0, s3.is256Color)(e4.fg) ? this._ctx.fillStyle = this._themeService.colors.ansi[e4.fg].css : this._ctx.fillStyle = this._themeService.colors.foreground.css, e4.y1 === e4.y2) this._fillBottomLineAtCells(e4.x1, e4.y1, e4.x2 - e4.x1);
            else {
              this._fillBottomLineAtCells(e4.x1, e4.y1, e4.cols - e4.x1);
              for (let t4 = e4.y1 + 1; t4 < e4.y2; t4++) this._fillBottomLineAtCells(0, t4, e4.cols);
              this._fillBottomLineAtCells(0, e4.y2, e4.x2);
            }
            this._state = e4;
          }
          _handleHideLinkUnderline(e4) {
            this._clearCurrentLink();
          }
        }
        t3.LinkRenderLayer = n2;
      }, 820: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.addDisposableDomListener = void 0, t3.addDisposableDomListener = function(e4, t4, i3, s3) {
          e4.addEventListener(t4, i3, s3);
          let r2 = false;
          return { dispose: () => {
            r2 || (r2 = true, e4.removeEventListener(t4, i3, s3));
          } };
        };
      }, 274: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CellColorResolver = void 0;
        const s3 = i3(855), r2 = i3(160), o2 = i3(374);
        let n2, a2 = 0, h2 = 0, l2 = false, c2 = false, d2 = false, _2 = 0;
        t3.CellColorResolver = class {
          constructor(e4, t4, i4, s4, r3, o3) {
            this._terminal = e4, this._optionService = t4, this._selectionRenderModel = i4, this._decorationService = s4, this._coreBrowserService = r3, this._themeService = o3, this.result = { fg: 0, bg: 0, ext: 0 };
          }
          resolve(e4, t4, i4, u2) {
            if (this.result.bg = e4.bg, this.result.fg = e4.fg, this.result.ext = 268435456 & e4.bg ? e4.extended.ext : 0, h2 = 0, a2 = 0, c2 = false, l2 = false, d2 = false, n2 = this._themeService.colors, _2 = 0, e4.getCode() !== s3.NULL_CELL_CODE && 4 === e4.extended.underlineStyle) {
              const e5 = Math.max(1, Math.floor(this._optionService.rawOptions.fontSize * this._coreBrowserService.dpr / 15));
              _2 = t4 * u2 % (2 * Math.round(e5));
            }
            if (this._decorationService.forEachDecorationAtCell(t4, i4, "bottom", ((e5) => {
              e5.backgroundColorRGB && (h2 = e5.backgroundColorRGB.rgba >> 8 & 16777215, c2 = true), e5.foregroundColorRGB && (a2 = e5.foregroundColorRGB.rgba >> 8 & 16777215, l2 = true);
            })), d2 = this._selectionRenderModel.isCellSelected(this._terminal, t4, i4), d2) {
              if (67108864 & this.result.fg || 0 != (50331648 & this.result.bg)) {
                if (67108864 & this.result.fg) switch (50331648 & this.result.fg) {
                  case 16777216:
                  case 33554432:
                    h2 = this._themeService.colors.ansi[255 & this.result.fg].rgba;
                    break;
                  case 50331648:
                    h2 = (16777215 & this.result.fg) << 8 | 255;
                    break;
                  default:
                    h2 = this._themeService.colors.foreground.rgba;
                }
                else switch (50331648 & this.result.bg) {
                  case 16777216:
                  case 33554432:
                    h2 = this._themeService.colors.ansi[255 & this.result.bg].rgba;
                    break;
                  case 50331648:
                    h2 = (16777215 & this.result.bg) << 8 | 255;
                }
                h2 = r2.rgba.blend(h2, 4294967040 & (this._coreBrowserService.isFocused ? n2.selectionBackgroundOpaque : n2.selectionInactiveBackgroundOpaque).rgba | 128) >> 8 & 16777215;
              } else h2 = (this._coreBrowserService.isFocused ? n2.selectionBackgroundOpaque : n2.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
              if (c2 = true, n2.selectionForeground && (a2 = n2.selectionForeground.rgba >> 8 & 16777215, l2 = true), (0, o2.treatGlyphAsBackgroundColor)(e4.getCode())) {
                if (67108864 & this.result.fg && 0 == (50331648 & this.result.bg)) a2 = (this._coreBrowserService.isFocused ? n2.selectionBackgroundOpaque : n2.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
                else {
                  if (67108864 & this.result.fg) switch (50331648 & this.result.bg) {
                    case 16777216:
                    case 33554432:
                      a2 = this._themeService.colors.ansi[255 & this.result.bg].rgba;
                      break;
                    case 50331648:
                      a2 = (16777215 & this.result.bg) << 8 | 255;
                  }
                  else switch (50331648 & this.result.fg) {
                    case 16777216:
                    case 33554432:
                      a2 = this._themeService.colors.ansi[255 & this.result.fg].rgba;
                      break;
                    case 50331648:
                      a2 = (16777215 & this.result.fg) << 8 | 255;
                      break;
                    default:
                      a2 = this._themeService.colors.foreground.rgba;
                  }
                  a2 = r2.rgba.blend(a2, 4294967040 & (this._coreBrowserService.isFocused ? n2.selectionBackgroundOpaque : n2.selectionInactiveBackgroundOpaque).rgba | 128) >> 8 & 16777215;
                }
                l2 = true;
              }
            }
            this._decorationService.forEachDecorationAtCell(t4, i4, "top", ((e5) => {
              e5.backgroundColorRGB && (h2 = e5.backgroundColorRGB.rgba >> 8 & 16777215, c2 = true), e5.foregroundColorRGB && (a2 = e5.foregroundColorRGB.rgba >> 8 & 16777215, l2 = true);
            })), c2 && (h2 = d2 ? -16777216 & e4.bg & -134217729 | h2 | 50331648 : -16777216 & e4.bg | h2 | 50331648), l2 && (a2 = -16777216 & e4.fg & -67108865 | a2 | 50331648), 67108864 & this.result.fg && (c2 && !l2 && (a2 = 0 == (50331648 & this.result.bg) ? -134217728 & this.result.fg | 16777215 & n2.background.rgba >> 8 | 50331648 : -134217728 & this.result.fg | 67108863 & this.result.bg, l2 = true), !c2 && l2 && (h2 = 0 == (50331648 & this.result.fg) ? -67108864 & this.result.bg | 16777215 & n2.foreground.rgba >> 8 | 50331648 : -67108864 & this.result.bg | 67108863 & this.result.fg, c2 = true)), n2 = void 0, this.result.bg = c2 ? h2 : this.result.bg, this.result.fg = l2 ? a2 : this.result.fg, this.result.ext &= 536870911, this.result.ext |= _2 << 29 & 3758096384;
          }
        };
      }, 627: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.removeTerminalFromCache = t3.acquireTextureAtlas = void 0;
        const s3 = i3(509), r2 = i3(197), o2 = [];
        t3.acquireTextureAtlas = function(e4, t4, i4, n2, a2, h2, l2, c2) {
          const d2 = (0, r2.generateConfig)(n2, a2, h2, l2, t4, i4, c2);
          for (let t5 = 0; t5 < o2.length; t5++) {
            const i5 = o2[t5], s4 = i5.ownedBy.indexOf(e4);
            if (s4 >= 0) {
              if ((0, r2.configEquals)(i5.config, d2)) return i5.atlas;
              1 === i5.ownedBy.length ? (i5.atlas.dispose(), o2.splice(t5, 1)) : i5.ownedBy.splice(s4, 1);
              break;
            }
          }
          for (let t5 = 0; t5 < o2.length; t5++) {
            const i5 = o2[t5];
            if ((0, r2.configEquals)(i5.config, d2)) return i5.ownedBy.push(e4), i5.atlas;
          }
          const _2 = e4._core, u2 = { atlas: new s3.TextureAtlas(document, d2, _2.unicodeService), config: d2, ownedBy: [e4] };
          return o2.push(u2), u2.atlas;
        }, t3.removeTerminalFromCache = function(e4) {
          for (let t4 = 0; t4 < o2.length; t4++) {
            const i4 = o2[t4].ownedBy.indexOf(e4);
            if (-1 !== i4) {
              1 === o2[t4].ownedBy.length ? (o2[t4].atlas.dispose(), o2.splice(t4, 1)) : o2[t4].ownedBy.splice(i4, 1);
              break;
            }
          }
        };
      }, 197: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.is256Color = t3.configEquals = t3.generateConfig = void 0;
        const s3 = i3(160);
        t3.generateConfig = function(e4, t4, i4, r2, o2, n2, a2) {
          const h2 = { foreground: n2.foreground, background: n2.background, cursor: s3.NULL_COLOR, cursorAccent: s3.NULL_COLOR, selectionForeground: s3.NULL_COLOR, selectionBackgroundTransparent: s3.NULL_COLOR, selectionBackgroundOpaque: s3.NULL_COLOR, selectionInactiveBackgroundTransparent: s3.NULL_COLOR, selectionInactiveBackgroundOpaque: s3.NULL_COLOR, ansi: n2.ansi.slice(), contrastCache: n2.contrastCache, halfContrastCache: n2.halfContrastCache };
          return { customGlyphs: o2.customGlyphs, devicePixelRatio: a2, letterSpacing: o2.letterSpacing, lineHeight: o2.lineHeight, deviceCellWidth: e4, deviceCellHeight: t4, deviceCharWidth: i4, deviceCharHeight: r2, fontFamily: o2.fontFamily, fontSize: o2.fontSize, fontWeight: o2.fontWeight, fontWeightBold: o2.fontWeightBold, allowTransparency: o2.allowTransparency, drawBoldTextInBrightColors: o2.drawBoldTextInBrightColors, minimumContrastRatio: o2.minimumContrastRatio, colors: h2 };
        }, t3.configEquals = function(e4, t4) {
          for (let i4 = 0; i4 < e4.colors.ansi.length; i4++) if (e4.colors.ansi[i4].rgba !== t4.colors.ansi[i4].rgba) return false;
          return e4.devicePixelRatio === t4.devicePixelRatio && e4.customGlyphs === t4.customGlyphs && e4.lineHeight === t4.lineHeight && e4.letterSpacing === t4.letterSpacing && e4.fontFamily === t4.fontFamily && e4.fontSize === t4.fontSize && e4.fontWeight === t4.fontWeight && e4.fontWeightBold === t4.fontWeightBold && e4.allowTransparency === t4.allowTransparency && e4.deviceCharWidth === t4.deviceCharWidth && e4.deviceCharHeight === t4.deviceCharHeight && e4.drawBoldTextInBrightColors === t4.drawBoldTextInBrightColors && e4.minimumContrastRatio === t4.minimumContrastRatio && e4.colors.foreground.rgba === t4.colors.foreground.rgba && e4.colors.background.rgba === t4.colors.background.rgba;
        }, t3.is256Color = function(e4) {
          return 16777216 == (50331648 & e4) || 33554432 == (50331648 & e4);
        };
      }, 237: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.TEXT_BASELINE = t3.DIM_OPACITY = t3.INVERTED_DEFAULT_COLOR = void 0;
        const s3 = i3(399);
        t3.INVERTED_DEFAULT_COLOR = 257, t3.DIM_OPACITY = 0.5, t3.TEXT_BASELINE = s3.isFirefox || s3.isLegacyEdge ? "bottom" : "ideographic";
      }, 457: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CursorBlinkStateManager = void 0;
        t3.CursorBlinkStateManager = class {
          constructor(e4, t4) {
            this._renderCallback = e4, this._coreBrowserService = t4, this.isCursorVisible = true, this._coreBrowserService.isFocused && this._restartInterval();
          }
          get isPaused() {
            return !(this._blinkStartTimeout || this._blinkInterval);
          }
          dispose() {
            this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout && (this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = void 0), this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          restartBlinkAnimation() {
            this.isPaused || (this._animationTimeRestarted = Date.now(), this.isCursorVisible = true, this._animationFrame || (this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => {
              this._renderCallback(), this._animationFrame = void 0;
            }))));
          }
          _restartInterval(e4 = 600) {
            this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout = this._coreBrowserService.window.setTimeout((() => {
              if (this._animationTimeRestarted) {
                const e5 = 600 - (Date.now() - this._animationTimeRestarted);
                if (this._animationTimeRestarted = void 0, e5 > 0) return void this._restartInterval(e5);
              }
              this.isCursorVisible = false, this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => {
                this._renderCallback(), this._animationFrame = void 0;
              })), this._blinkInterval = this._coreBrowserService.window.setInterval((() => {
                if (this._animationTimeRestarted) {
                  const e5 = 600 - (Date.now() - this._animationTimeRestarted);
                  return this._animationTimeRestarted = void 0, void this._restartInterval(e5);
                }
                this.isCursorVisible = !this.isCursorVisible, this._animationFrame = this._coreBrowserService.window.requestAnimationFrame((() => {
                  this._renderCallback(), this._animationFrame = void 0;
                }));
              }), 600);
            }), e4);
          }
          pause() {
            this.isCursorVisible = true, this._blinkInterval && (this._coreBrowserService.window.clearInterval(this._blinkInterval), this._blinkInterval = void 0), this._blinkStartTimeout && (this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout), this._blinkStartTimeout = void 0), this._animationFrame && (this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame), this._animationFrame = void 0);
          }
          resume() {
            this.pause(), this._animationTimeRestarted = void 0, this._restartInterval(), this.restartBlinkAnimation();
          }
        };
      }, 860: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.tryDrawCustomChar = t3.powerlineDefinitions = t3.boxDrawingDefinitions = t3.blockElementDefinitions = void 0;
        const s3 = i3(374);
        t3.blockElementDefinitions = { "▀": [{ x: 0, y: 0, w: 8, h: 4 }], "▁": [{ x: 0, y: 7, w: 8, h: 1 }], "▂": [{ x: 0, y: 6, w: 8, h: 2 }], "▃": [{ x: 0, y: 5, w: 8, h: 3 }], "▄": [{ x: 0, y: 4, w: 8, h: 4 }], "▅": [{ x: 0, y: 3, w: 8, h: 5 }], "▆": [{ x: 0, y: 2, w: 8, h: 6 }], "▇": [{ x: 0, y: 1, w: 8, h: 7 }], "█": [{ x: 0, y: 0, w: 8, h: 8 }], "▉": [{ x: 0, y: 0, w: 7, h: 8 }], "▊": [{ x: 0, y: 0, w: 6, h: 8 }], "▋": [{ x: 0, y: 0, w: 5, h: 8 }], "▌": [{ x: 0, y: 0, w: 4, h: 8 }], "▍": [{ x: 0, y: 0, w: 3, h: 8 }], "▎": [{ x: 0, y: 0, w: 2, h: 8 }], "▏": [{ x: 0, y: 0, w: 1, h: 8 }], "▐": [{ x: 4, y: 0, w: 4, h: 8 }], "▔": [{ x: 0, y: 0, w: 8, h: 1 }], "▕": [{ x: 7, y: 0, w: 1, h: 8 }], "▖": [{ x: 0, y: 4, w: 4, h: 4 }], "▗": [{ x: 4, y: 4, w: 4, h: 4 }], "▘": [{ x: 0, y: 0, w: 4, h: 4 }], "▙": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }], "▚": [{ x: 0, y: 0, w: 4, h: 4 }, { x: 4, y: 4, w: 4, h: 4 }], "▛": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 4, y: 0, w: 4, h: 4 }], "▜": [{ x: 0, y: 0, w: 8, h: 4 }, { x: 4, y: 0, w: 4, h: 8 }], "▝": [{ x: 4, y: 0, w: 4, h: 4 }], "▞": [{ x: 4, y: 0, w: 4, h: 4 }, { x: 0, y: 4, w: 4, h: 4 }], "▟": [{ x: 4, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }], "🭰": [{ x: 1, y: 0, w: 1, h: 8 }], "🭱": [{ x: 2, y: 0, w: 1, h: 8 }], "🭲": [{ x: 3, y: 0, w: 1, h: 8 }], "🭳": [{ x: 4, y: 0, w: 1, h: 8 }], "🭴": [{ x: 5, y: 0, w: 1, h: 8 }], "🭵": [{ x: 6, y: 0, w: 1, h: 8 }], "🭶": [{ x: 0, y: 1, w: 8, h: 1 }], "🭷": [{ x: 0, y: 2, w: 8, h: 1 }], "🭸": [{ x: 0, y: 3, w: 8, h: 1 }], "🭹": [{ x: 0, y: 4, w: 8, h: 1 }], "🭺": [{ x: 0, y: 5, w: 8, h: 1 }], "🭻": [{ x: 0, y: 6, w: 8, h: 1 }], "🭼": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }], "🭽": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }], "🭾": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }], "🭿": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }], "🮀": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }], "🮁": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 2, w: 8, h: 1 }, { x: 0, y: 4, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }], "🮂": [{ x: 0, y: 0, w: 8, h: 2 }], "🮃": [{ x: 0, y: 0, w: 8, h: 3 }], "🮄": [{ x: 0, y: 0, w: 8, h: 5 }], "🮅": [{ x: 0, y: 0, w: 8, h: 6 }], "🮆": [{ x: 0, y: 0, w: 8, h: 7 }], "🮇": [{ x: 6, y: 0, w: 2, h: 8 }], "🮈": [{ x: 5, y: 0, w: 3, h: 8 }], "🮉": [{ x: 3, y: 0, w: 5, h: 8 }], "🮊": [{ x: 2, y: 0, w: 6, h: 8 }], "🮋": [{ x: 1, y: 0, w: 7, h: 8 }], "🮕": [{ x: 0, y: 0, w: 2, h: 2 }, { x: 4, y: 0, w: 2, h: 2 }, { x: 2, y: 2, w: 2, h: 2 }, { x: 6, y: 2, w: 2, h: 2 }, { x: 0, y: 4, w: 2, h: 2 }, { x: 4, y: 4, w: 2, h: 2 }, { x: 2, y: 6, w: 2, h: 2 }, { x: 6, y: 6, w: 2, h: 2 }], "🮖": [{ x: 2, y: 0, w: 2, h: 2 }, { x: 6, y: 0, w: 2, h: 2 }, { x: 0, y: 2, w: 2, h: 2 }, { x: 4, y: 2, w: 2, h: 2 }, { x: 2, y: 4, w: 2, h: 2 }, { x: 6, y: 4, w: 2, h: 2 }, { x: 0, y: 6, w: 2, h: 2 }, { x: 4, y: 6, w: 2, h: 2 }], "🮗": [{ x: 0, y: 2, w: 8, h: 2 }, { x: 0, y: 6, w: 8, h: 2 }] };
        const r2 = { "░": [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 0]], "▒": [[1, 0], [0, 0], [0, 1], [0, 0]], "▓": [[0, 1], [1, 1], [1, 0], [1, 1]] };
        t3.boxDrawingDefinitions = { "─": { 1: "M0,.5 L1,.5" }, "━": { 3: "M0,.5 L1,.5" }, "│": { 1: "M.5,0 L.5,1" }, "┃": { 3: "M.5,0 L.5,1" }, "┌": { 1: "M0.5,1 L.5,.5 L1,.5" }, "┏": { 3: "M0.5,1 L.5,.5 L1,.5" }, "┐": { 1: "M0,.5 L.5,.5 L.5,1" }, "┓": { 3: "M0,.5 L.5,.5 L.5,1" }, "└": { 1: "M.5,0 L.5,.5 L1,.5" }, "┗": { 3: "M.5,0 L.5,.5 L1,.5" }, "┘": { 1: "M.5,0 L.5,.5 L0,.5" }, "┛": { 3: "M.5,0 L.5,.5 L0,.5" }, "├": { 1: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "┣": { 3: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "┤": { 1: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "┫": { 3: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "┬": { 1: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "┳": { 3: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "┴": { 1: "M0,.5 L1,.5 M.5,.5 L.5,0" }, "┻": { 3: "M0,.5 L1,.5 M.5,.5 L.5,0" }, "┼": { 1: "M0,.5 L1,.5 M.5,0 L.5,1" }, "╋": { 3: "M0,.5 L1,.5 M.5,0 L.5,1" }, "╴": { 1: "M.5,.5 L0,.5" }, "╸": { 3: "M.5,.5 L0,.5" }, "╵": { 1: "M.5,.5 L.5,0" }, "╹": { 3: "M.5,.5 L.5,0" }, "╶": { 1: "M.5,.5 L1,.5" }, "╺": { 3: "M.5,.5 L1,.5" }, "╷": { 1: "M.5,.5 L.5,1" }, "╻": { 3: "M.5,.5 L.5,1" }, "═": { 1: (e4, t4) => `M0,${0.5 - t4} L1,${0.5 - t4} M0,${0.5 + t4} L1,${0.5 + t4}` }, "║": { 1: (e4, t4) => `M${0.5 - e4},0 L${0.5 - e4},1 M${0.5 + e4},0 L${0.5 + e4},1` }, "╒": { 1: (e4, t4) => `M.5,1 L.5,${0.5 - t4} L1,${0.5 - t4} M.5,${0.5 + t4} L1,${0.5 + t4}` }, "╓": { 1: (e4, t4) => `M${0.5 - e4},1 L${0.5 - e4},.5 L1,.5 M${0.5 + e4},.5 L${0.5 + e4},1` }, "╔": { 1: (e4, t4) => `M1,${0.5 - t4} L${0.5 - e4},${0.5 - t4} L${0.5 - e4},1 M1,${0.5 + t4} L${0.5 + e4},${0.5 + t4} L${0.5 + e4},1` }, "╕": { 1: (e4, t4) => `M0,${0.5 - t4} L.5,${0.5 - t4} L.5,1 M0,${0.5 + t4} L.5,${0.5 + t4}` }, "╖": { 1: (e4, t4) => `M${0.5 + e4},1 L${0.5 + e4},.5 L0,.5 M${0.5 - e4},.5 L${0.5 - e4},1` }, "╗": { 1: (e4, t4) => `M0,${0.5 + t4} L${0.5 - e4},${0.5 + t4} L${0.5 - e4},1 M0,${0.5 - t4} L${0.5 + e4},${0.5 - t4} L${0.5 + e4},1` }, "╘": { 1: (e4, t4) => `M.5,0 L.5,${0.5 + t4} L1,${0.5 + t4} M.5,${0.5 - t4} L1,${0.5 - t4}` }, "╙": { 1: (e4, t4) => `M1,.5 L${0.5 - e4},.5 L${0.5 - e4},0 M${0.5 + e4},.5 L${0.5 + e4},0` }, "╚": { 1: (e4, t4) => `M1,${0.5 - t4} L${0.5 + e4},${0.5 - t4} L${0.5 + e4},0 M1,${0.5 + t4} L${0.5 - e4},${0.5 + t4} L${0.5 - e4},0` }, "╛": { 1: (e4, t4) => `M0,${0.5 + t4} L.5,${0.5 + t4} L.5,0 M0,${0.5 - t4} L.5,${0.5 - t4}` }, "╜": { 1: (e4, t4) => `M0,.5 L${0.5 + e4},.5 L${0.5 + e4},0 M${0.5 - e4},.5 L${0.5 - e4},0` }, "╝": { 1: (e4, t4) => `M0,${0.5 - t4} L${0.5 - e4},${0.5 - t4} L${0.5 - e4},0 M0,${0.5 + t4} L${0.5 + e4},${0.5 + t4} L${0.5 + e4},0` }, "╞": { 1: (e4, t4) => `M.5,0 L.5,1 M.5,${0.5 - t4} L1,${0.5 - t4} M.5,${0.5 + t4} L1,${0.5 + t4}` }, "╟": { 1: (e4, t4) => `M${0.5 - e4},0 L${0.5 - e4},1 M${0.5 + e4},0 L${0.5 + e4},1 M${0.5 + e4},.5 L1,.5` }, "╠": { 1: (e4, t4) => `M${0.5 - e4},0 L${0.5 - e4},1 M1,${0.5 + t4} L${0.5 + e4},${0.5 + t4} L${0.5 + e4},1 M1,${0.5 - t4} L${0.5 + e4},${0.5 - t4} L${0.5 + e4},0` }, "╡": { 1: (e4, t4) => `M.5,0 L.5,1 M0,${0.5 - t4} L.5,${0.5 - t4} M0,${0.5 + t4} L.5,${0.5 + t4}` }, "╢": { 1: (e4, t4) => `M0,.5 L${0.5 - e4},.5 M${0.5 - e4},0 L${0.5 - e4},1 M${0.5 + e4},0 L${0.5 + e4},1` }, "╣": { 1: (e4, t4) => `M${0.5 + e4},0 L${0.5 + e4},1 M0,${0.5 + t4} L${0.5 - e4},${0.5 + t4} L${0.5 - e4},1 M0,${0.5 - t4} L${0.5 - e4},${0.5 - t4} L${0.5 - e4},0` }, "╤": { 1: (e4, t4) => `M0,${0.5 - t4} L1,${0.5 - t4} M0,${0.5 + t4} L1,${0.5 + t4} M.5,${0.5 + t4} L.5,1` }, "╥": { 1: (e4, t4) => `M0,.5 L1,.5 M${0.5 - e4},.5 L${0.5 - e4},1 M${0.5 + e4},.5 L${0.5 + e4},1` }, "╦": { 1: (e4, t4) => `M0,${0.5 - t4} L1,${0.5 - t4} M0,${0.5 + t4} L${0.5 - e4},${0.5 + t4} L${0.5 - e4},1 M1,${0.5 + t4} L${0.5 + e4},${0.5 + t4} L${0.5 + e4},1` }, "╧": { 1: (e4, t4) => `M.5,0 L.5,${0.5 - t4} M0,${0.5 - t4} L1,${0.5 - t4} M0,${0.5 + t4} L1,${0.5 + t4}` }, "╨": { 1: (e4, t4) => `M0,.5 L1,.5 M${0.5 - e4},.5 L${0.5 - e4},0 M${0.5 + e4},.5 L${0.5 + e4},0` }, "╩": { 1: (e4, t4) => `M0,${0.5 + t4} L1,${0.5 + t4} M0,${0.5 - t4} L${0.5 - e4},${0.5 - t4} L${0.5 - e4},0 M1,${0.5 - t4} L${0.5 + e4},${0.5 - t4} L${0.5 + e4},0` }, "╪": { 1: (e4, t4) => `M.5,0 L.5,1 M0,${0.5 - t4} L1,${0.5 - t4} M0,${0.5 + t4} L1,${0.5 + t4}` }, "╫": { 1: (e4, t4) => `M0,.5 L1,.5 M${0.5 - e4},0 L${0.5 - e4},1 M${0.5 + e4},0 L${0.5 + e4},1` }, "╬": { 1: (e4, t4) => `M0,${0.5 + t4} L${0.5 - e4},${0.5 + t4} L${0.5 - e4},1 M1,${0.5 + t4} L${0.5 + e4},${0.5 + t4} L${0.5 + e4},1 M0,${0.5 - t4} L${0.5 - e4},${0.5 - t4} L${0.5 - e4},0 M1,${0.5 - t4} L${0.5 + e4},${0.5 - t4} L${0.5 + e4},0` }, "╱": { 1: "M1,0 L0,1" }, "╲": { 1: "M0,0 L1,1" }, "╳": { 1: "M1,0 L0,1 M0,0 L1,1" }, "╼": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "╽": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L.5,1" }, "╾": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "╿": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "┍": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L1,.5" }, "┎": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "┑": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L0,.5" }, "┒": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L.5,1" }, "┕": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L1,.5" }, "┖": { 1: "M.5,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "┙": { 1: "M.5,.5 L.5,0", 3: "M.5,.5 L0,.5" }, "┚": { 1: "M.5,.5 L0,.5", 3: "M.5,.5 L.5,0" }, "┝": { 1: "M.5,0 L.5,1", 3: "M.5,.5 L1,.5" }, "┞": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "┟": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "┠": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,1" }, "┡": { 1: "M.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L1,.5" }, "┢": { 1: "M.5,.5 L.5,0", 3: "M0.5,1 L.5,.5 L1,.5" }, "┥": { 1: "M.5,0 L.5,1", 3: "M.5,.5 L0,.5" }, "┦": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "┧": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M.5,.5 L.5,1" }, "┨": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,1" }, "┩": { 1: "M.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L0,.5" }, "┪": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L.5,.5 L.5,1" }, "┭": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "┮": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,.5 L1,.5" }, "┯": { 1: "M.5,.5 L.5,1", 3: "M0,.5 L1,.5" }, "┰": { 1: "M0,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "┱": { 1: "M.5,.5 L1,.5", 3: "M0,.5 L.5,.5 L.5,1" }, "┲": { 1: "M.5,.5 L0,.5", 3: "M0.5,1 L.5,.5 L1,.5" }, "┵": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "┶": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "┷": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L1,.5" }, "┸": { 1: "M0,.5 L1,.5", 3: "M.5,.5 L.5,0" }, "┹": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,.5 L0,.5" }, "┺": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,.5 L1,.5" }, "┽": { 1: "M.5,0 L.5,1 M.5,.5 L1,.5", 3: "M.5,.5 L0,.5" }, "┾": { 1: "M.5,0 L.5,1 M.5,.5 L0,.5", 3: "M.5,.5 L1,.5" }, "┿": { 1: "M.5,0 L.5,1", 3: "M0,.5 L1,.5" }, "╀": { 1: "M0,.5 L1,.5 M.5,.5 L.5,1", 3: "M.5,.5 L.5,0" }, "╁": { 1: "M.5,.5 L.5,0 M0,.5 L1,.5", 3: "M.5,.5 L.5,1" }, "╂": { 1: "M0,.5 L1,.5", 3: "M.5,0 L.5,1" }, "╃": { 1: "M0.5,1 L.5,.5 L1,.5", 3: "M.5,0 L.5,.5 L0,.5" }, "╄": { 1: "M0,.5 L.5,.5 L.5,1", 3: "M.5,0 L.5,.5 L1,.5" }, "╅": { 1: "M.5,0 L.5,.5 L1,.5", 3: "M0,.5 L.5,.5 L.5,1" }, "╆": { 1: "M.5,0 L.5,.5 L0,.5", 3: "M0.5,1 L.5,.5 L1,.5" }, "╇": { 1: "M.5,.5 L.5,1", 3: "M.5,.5 L.5,0 M0,.5 L1,.5" }, "╈": { 1: "M.5,.5 L.5,0", 3: "M0,.5 L1,.5 M.5,.5 L.5,1" }, "╉": { 1: "M.5,.5 L1,.5", 3: "M.5,0 L.5,1 M.5,.5 L0,.5" }, "╊": { 1: "M.5,.5 L0,.5", 3: "M.5,0 L.5,1 M.5,.5 L1,.5" }, "╌": { 1: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" }, "╍": { 3: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" }, "┄": { 1: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" }, "┅": { 3: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" }, "┈": { 1: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" }, "┉": { 3: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" }, "╎": { 1: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" }, "╏": { 3: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" }, "┆": { 1: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" }, "┇": { 3: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" }, "┊": { 1: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" }, "┋": { 3: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" }, "╭": { 1: (e4, t4) => `M.5,1 L.5,${0.5 + t4 / 0.15 * 0.5} C.5,${0.5 + t4 / 0.15 * 0.5},.5,.5,1,.5` }, "╮": { 1: (e4, t4) => `M.5,1 L.5,${0.5 + t4 / 0.15 * 0.5} C.5,${0.5 + t4 / 0.15 * 0.5},.5,.5,0,.5` }, "╯": { 1: (e4, t4) => `M.5,0 L.5,${0.5 - t4 / 0.15 * 0.5} C.5,${0.5 - t4 / 0.15 * 0.5},.5,.5,0,.5` }, "╰": { 1: (e4, t4) => `M.5,0 L.5,${0.5 - t4 / 0.15 * 0.5} C.5,${0.5 - t4 / 0.15 * 0.5},.5,.5,1,.5` } }, t3.powerlineDefinitions = { "": { d: "M0,0 L1,.5 L0,1", type: 0, rightPadding: 2 }, "": { d: "M-1,-.5 L1,.5 L-1,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "": { d: "M1,0 L0,.5 L1,1", type: 0, leftPadding: 2 }, "": { d: "M2,-.5 L0,.5 L2,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "": { d: "M0,0 L0,1 C0.552,1,1,0.776,1,.5 C1,0.224,0.552,0,0,0", type: 0, rightPadding: 1 }, "": { d: "M.2,1 C.422,1,.8,.826,.78,.5 C.8,.174,0.422,0,.2,0", type: 1, rightPadding: 1 }, "": { d: "M1,0 L1,1 C0.448,1,0,0.776,0,.5 C0,0.224,0.448,0,1,0", type: 0, leftPadding: 1 }, "": { d: "M.8,1 C0.578,1,0.2,.826,.22,.5 C0.2,0.174,0.578,0,0.8,0", type: 1, leftPadding: 1 }, "": { d: "M-.5,-.5 L1.5,1.5 L-.5,1.5", type: 0 }, "": { d: "M-.5,-.5 L1.5,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "": { d: "M1.5,-.5 L-.5,1.5 L1.5,1.5", type: 0 }, "": { d: "M1.5,-.5 L-.5,1.5 L-.5,-.5", type: 0 }, "": { d: "M1.5,-.5 L-.5,1.5", type: 1, leftPadding: 1, rightPadding: 1 }, "": { d: "M-.5,-.5 L1.5,1.5 L1.5,-.5", type: 0 } }, t3.powerlineDefinitions[""] = t3.powerlineDefinitions[""], t3.powerlineDefinitions[""] = t3.powerlineDefinitions[""], t3.tryDrawCustomChar = function(e4, i4, n3, l2, c2, d2, _2, u2) {
          const g2 = t3.blockElementDefinitions[i4];
          if (g2) return (function(e5, t4, i5, s4, r3, o3) {
            for (let n4 = 0; n4 < t4.length; n4++) {
              const a3 = t4[n4], h3 = r3 / 8, l3 = o3 / 8;
              e5.fillRect(i5 + a3.x * h3, s4 + a3.y * l3, a3.w * h3, a3.h * l3);
            }
          })(e4, g2, n3, l2, c2, d2), true;
          const v2 = r2[i4];
          if (v2) return (function(e5, t4, i5, r3, n4, a3) {
            let h3 = o2.get(t4);
            h3 || (h3 = /* @__PURE__ */ new Map(), o2.set(t4, h3));
            const l3 = e5.fillStyle;
            if ("string" != typeof l3) throw new Error(`Unexpected fillStyle type "${l3}"`);
            let c3 = h3.get(l3);
            if (!c3) {
              const i6 = t4[0].length, r4 = t4.length, o3 = e5.canvas.ownerDocument.createElement("canvas");
              o3.width = i6, o3.height = r4;
              const n5 = (0, s3.throwIfFalsy)(o3.getContext("2d")), a4 = new ImageData(i6, r4);
              let d3, _3, u3, g3;
              if (l3.startsWith("#")) d3 = parseInt(l3.slice(1, 3), 16), _3 = parseInt(l3.slice(3, 5), 16), u3 = parseInt(l3.slice(5, 7), 16), g3 = l3.length > 7 && parseInt(l3.slice(7, 9), 16) || 1;
              else {
                if (!l3.startsWith("rgba")) throw new Error(`Unexpected fillStyle color format "${l3}" when drawing pattern glyph`);
                [d3, _3, u3, g3] = l3.substring(5, l3.length - 1).split(",").map(((e6) => parseFloat(e6)));
              }
              for (let e6 = 0; e6 < r4; e6++) for (let s4 = 0; s4 < i6; s4++) a4.data[4 * (e6 * i6 + s4)] = d3, a4.data[4 * (e6 * i6 + s4) + 1] = _3, a4.data[4 * (e6 * i6 + s4) + 2] = u3, a4.data[4 * (e6 * i6 + s4) + 3] = t4[e6][s4] * (255 * g3);
              n5.putImageData(a4, 0, 0), c3 = (0, s3.throwIfFalsy)(e5.createPattern(o3, null)), h3.set(l3, c3);
            }
            e5.fillStyle = c3, e5.fillRect(i5, r3, n4, a3);
          })(e4, v2, n3, l2, c2, d2), true;
          const f2 = t3.boxDrawingDefinitions[i4];
          if (f2) return (function(e5, t4, i5, s4, r3, o3, n4) {
            e5.strokeStyle = e5.fillStyle;
            for (const [l3, c3] of Object.entries(t4)) {
              let t5;
              e5.beginPath(), e5.lineWidth = n4 * Number.parseInt(l3), t5 = "function" == typeof c3 ? c3(0.15, 0.15 / o3 * r3) : c3;
              for (const l4 of t5.split(" ")) {
                const t6 = l4[0], c4 = a2[t6];
                if (!c4) {
                  console.error(`Could not find drawing instructions for "${t6}"`);
                  continue;
                }
                const d3 = l4.substring(1).split(",");
                d3[0] && d3[1] && c4(e5, h2(d3, r3, o3, i5, s4, true, n4));
              }
              e5.stroke(), e5.closePath();
            }
          })(e4, f2, n3, l2, c2, d2, u2), true;
          const p2 = t3.powerlineDefinitions[i4];
          return !!p2 && ((function(e5, t4, i5, s4, r3, o3, n4, l3) {
            const c3 = new Path2D();
            c3.rect(i5, s4, r3, o3), e5.clip(c3), e5.beginPath();
            const d3 = n4 / 12;
            e5.lineWidth = l3 * d3;
            for (const n5 of t4.d.split(" ")) {
              const c4 = n5[0], _3 = a2[c4];
              if (!_3) {
                console.error(`Could not find drawing instructions for "${c4}"`);
                continue;
              }
              const u3 = n5.substring(1).split(",");
              u3[0] && u3[1] && _3(e5, h2(u3, r3, o3, i5, s4, false, l3, (t4.leftPadding ?? 0) * (d3 / 2), (t4.rightPadding ?? 0) * (d3 / 2)));
            }
            1 === t4.type ? (e5.strokeStyle = e5.fillStyle, e5.stroke()) : e5.fill(), e5.closePath();
          })(e4, p2, n3, l2, c2, d2, _2, u2), true);
        };
        const o2 = /* @__PURE__ */ new Map();
        function n2(e4, t4, i4 = 0) {
          return Math.max(Math.min(e4, t4), i4);
        }
        const a2 = { C: (e4, t4) => e4.bezierCurveTo(t4[0], t4[1], t4[2], t4[3], t4[4], t4[5]), L: (e4, t4) => e4.lineTo(t4[0], t4[1]), M: (e4, t4) => e4.moveTo(t4[0], t4[1]) };
        function h2(e4, t4, i4, s4, r3, o3, a3, h3 = 0, l2 = 0) {
          const c2 = e4.map(((e5) => parseFloat(e5) || parseInt(e5)));
          if (c2.length < 2) throw new Error("Too few arguments for instruction");
          for (let e5 = 0; e5 < c2.length; e5 += 2) c2[e5] *= t4 - h3 * a3 - l2 * a3, o3 && 0 !== c2[e5] && (c2[e5] = n2(Math.round(c2[e5] + 0.5) - 0.5, t4, 0)), c2[e5] += s4 + h3 * a3;
          for (let e5 = 1; e5 < c2.length; e5 += 2) c2[e5] *= i4, o3 && 0 !== c2[e5] && (c2[e5] = n2(Math.round(c2[e5] + 0.5) - 0.5, i4, 0)), c2[e5] += r3;
          return c2;
        }
      }, 56: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.observeDevicePixelDimensions = void 0;
        const s3 = i3(859);
        t3.observeDevicePixelDimensions = function(e4, t4, i4) {
          let r2 = new t4.ResizeObserver(((t5) => {
            const s4 = t5.find(((t6) => t6.target === e4));
            if (!s4) return;
            if (!("devicePixelContentBoxSize" in s4)) return r2?.disconnect(), void (r2 = void 0);
            const o2 = s4.devicePixelContentBoxSize[0].inlineSize, n2 = s4.devicePixelContentBoxSize[0].blockSize;
            o2 > 0 && n2 > 0 && i4(o2, n2);
          }));
          try {
            r2.observe(e4, { box: ["device-pixel-content-box"] });
          } catch {
            r2.disconnect(), r2 = void 0;
          }
          return (0, s3.toDisposable)((() => r2?.disconnect()));
        };
      }, 374: (e3, t3) => {
        function i3(e4) {
          return 57508 <= e4 && e4 <= 57558;
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.computeNextVariantOffset = t3.createRenderDimensions = t3.treatGlyphAsBackgroundColor = t3.isRestrictedPowerlineGlyph = t3.isPowerlineGlyph = t3.throwIfFalsy = void 0, t3.throwIfFalsy = function(e4) {
          if (!e4) throw new Error("value must not be falsy");
          return e4;
        }, t3.isPowerlineGlyph = i3, t3.isRestrictedPowerlineGlyph = function(e4) {
          return 57520 <= e4 && e4 <= 57527;
        }, t3.treatGlyphAsBackgroundColor = function(e4) {
          return i3(e4) || (function(e5) {
            return 9472 <= e5 && e5 <= 9631;
          })(e4);
        }, t3.createRenderDimensions = function() {
          return { css: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 } }, device: { canvas: { width: 0, height: 0 }, cell: { width: 0, height: 0 }, char: { width: 0, height: 0, left: 0, top: 0 } } };
        }, t3.computeNextVariantOffset = function(e4, t4, i4 = 0) {
          return (e4 - (2 * Math.round(t4) - i4)) % (2 * Math.round(t4));
        };
      }, 296: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.createSelectionRenderModel = void 0;
        class i3 {
          constructor() {
            this.clear();
          }
          clear() {
            this.hasSelection = false, this.columnSelectMode = false, this.viewportStartRow = 0, this.viewportEndRow = 0, this.viewportCappedStartRow = 0, this.viewportCappedEndRow = 0, this.startCol = 0, this.endCol = 0, this.selectionStart = void 0, this.selectionEnd = void 0;
          }
          update(e4, t4, i4, s3 = false) {
            if (this.selectionStart = t4, this.selectionEnd = i4, !t4 || !i4 || t4[0] === i4[0] && t4[1] === i4[1]) return void this.clear();
            const r2 = e4.buffers.active.ydisp, o2 = t4[1] - r2, n2 = i4[1] - r2, a2 = Math.max(o2, 0), h2 = Math.min(n2, e4.rows - 1);
            a2 >= e4.rows || h2 < 0 ? this.clear() : (this.hasSelection = true, this.columnSelectMode = s3, this.viewportStartRow = o2, this.viewportEndRow = n2, this.viewportCappedStartRow = a2, this.viewportCappedEndRow = h2, this.startCol = t4[0], this.endCol = i4[0]);
          }
          isCellSelected(e4, t4, i4) {
            return !!this.hasSelection && (i4 -= e4.buffer.active.viewportY, this.columnSelectMode ? this.startCol <= this.endCol ? t4 >= this.startCol && i4 >= this.viewportCappedStartRow && t4 < this.endCol && i4 <= this.viewportCappedEndRow : t4 < this.startCol && i4 >= this.viewportCappedStartRow && t4 >= this.endCol && i4 <= this.viewportCappedEndRow : i4 > this.viewportStartRow && i4 < this.viewportEndRow || this.viewportStartRow === this.viewportEndRow && i4 === this.viewportStartRow && t4 >= this.startCol && t4 < this.endCol || this.viewportStartRow < this.viewportEndRow && i4 === this.viewportEndRow && t4 < this.endCol || this.viewportStartRow < this.viewportEndRow && i4 === this.viewportStartRow && t4 >= this.startCol);
          }
        }
        t3.createSelectionRenderModel = function() {
          return new i3();
        };
      }, 509: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.TextureAtlas = void 0;
        const s3 = i3(237), r2 = i3(860), o2 = i3(374), n2 = i3(160), a2 = i3(345), h2 = i3(485), l2 = i3(385), c2 = i3(147), d2 = i3(855), _2 = { texturePage: 0, texturePosition: { x: 0, y: 0 }, texturePositionClipSpace: { x: 0, y: 0 }, offset: { x: 0, y: 0 }, size: { x: 0, y: 0 }, sizeClipSpace: { x: 0, y: 0 } };
        let u2;
        class g2 {
          get pages() {
            return this._pages;
          }
          constructor(e4, t4, i4) {
            this._document = e4, this._config = t4, this._unicodeService = i4, this._didWarmUp = false, this._cacheMap = new h2.FourKeyMap(), this._cacheMapCombined = new h2.FourKeyMap(), this._pages = [], this._activePages = [], this._workBoundingBox = { top: 0, left: 0, bottom: 0, right: 0 }, this._workAttributeData = new c2.AttributeData(), this._textureSize = 512, this._onAddTextureAtlasCanvas = new a2.EventEmitter(), this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event, this._onRemoveTextureAtlasCanvas = new a2.EventEmitter(), this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event, this._requestClearModel = false, this._createNewPage(), this._tmpCanvas = p2(e4, 4 * this._config.deviceCellWidth + 4, this._config.deviceCellHeight + 4), this._tmpCtx = (0, o2.throwIfFalsy)(this._tmpCanvas.getContext("2d", { alpha: this._config.allowTransparency, willReadFrequently: true }));
          }
          dispose() {
            for (const e4 of this.pages) e4.canvas.remove();
            this._onAddTextureAtlasCanvas.dispose();
          }
          warmUp() {
            this._didWarmUp || (this._doWarmUp(), this._didWarmUp = true);
          }
          _doWarmUp() {
            const e4 = new l2.IdleTaskQueue();
            for (let t4 = 33; t4 < 126; t4++) e4.enqueue((() => {
              if (!this._cacheMap.get(t4, d2.DEFAULT_COLOR, d2.DEFAULT_COLOR, d2.DEFAULT_EXT)) {
                const e5 = this._drawToCache(t4, d2.DEFAULT_COLOR, d2.DEFAULT_COLOR, d2.DEFAULT_EXT);
                this._cacheMap.set(t4, d2.DEFAULT_COLOR, d2.DEFAULT_COLOR, d2.DEFAULT_EXT, e5);
              }
            }));
          }
          beginFrame() {
            return this._requestClearModel;
          }
          clearTexture() {
            if (0 !== this._pages[0].currentRow.x || 0 !== this._pages[0].currentRow.y) {
              for (const e4 of this._pages) e4.clear();
              this._cacheMap.clear(), this._cacheMapCombined.clear(), this._didWarmUp = false;
            }
          }
          _createNewPage() {
            if (g2.maxAtlasPages && this._pages.length >= Math.max(4, g2.maxAtlasPages)) {
              const e5 = this._pages.filter(((e6) => 2 * e6.canvas.width <= (g2.maxTextureSize || 4096))).sort(((e6, t5) => t5.canvas.width !== e6.canvas.width ? t5.canvas.width - e6.canvas.width : t5.percentageUsed - e6.percentageUsed));
              let t4 = -1, i4 = 0;
              for (let s5 = 0; s5 < e5.length; s5++) if (e5[s5].canvas.width !== i4) t4 = s5, i4 = e5[s5].canvas.width;
              else if (s5 - t4 == 3) break;
              const s4 = e5.slice(t4, t4 + 4), r3 = s4.map(((e6) => e6.glyphs[0].texturePage)).sort(((e6, t5) => e6 > t5 ? 1 : -1)), o3 = this.pages.length - s4.length, n3 = this._mergePages(s4, o3);
              n3.version++;
              for (let e6 = r3.length - 1; e6 >= 0; e6--) this._deletePage(r3[e6]);
              this.pages.push(n3), this._requestClearModel = true, this._onAddTextureAtlasCanvas.fire(n3.canvas);
            }
            const e4 = new v2(this._document, this._textureSize);
            return this._pages.push(e4), this._activePages.push(e4), this._onAddTextureAtlasCanvas.fire(e4.canvas), e4;
          }
          _mergePages(e4, t4) {
            const i4 = 2 * e4[0].canvas.width, s4 = new v2(this._document, i4, e4);
            for (const [r3, o3] of e4.entries()) {
              const e5 = r3 * o3.canvas.width % i4, n3 = Math.floor(r3 / 2) * o3.canvas.height;
              s4.ctx.drawImage(o3.canvas, e5, n3);
              for (const s5 of o3.glyphs) s5.texturePage = t4, s5.sizeClipSpace.x = s5.size.x / i4, s5.sizeClipSpace.y = s5.size.y / i4, s5.texturePosition.x += e5, s5.texturePosition.y += n3, s5.texturePositionClipSpace.x = s5.texturePosition.x / i4, s5.texturePositionClipSpace.y = s5.texturePosition.y / i4;
              this._onRemoveTextureAtlasCanvas.fire(o3.canvas);
              const a3 = this._activePages.indexOf(o3);
              -1 !== a3 && this._activePages.splice(a3, 1);
            }
            return s4;
          }
          _deletePage(e4) {
            this._pages.splice(e4, 1);
            for (let t4 = e4; t4 < this._pages.length; t4++) {
              const e5 = this._pages[t4];
              for (const t5 of e5.glyphs) t5.texturePage--;
              e5.version++;
            }
          }
          getRasterizedGlyphCombinedChar(e4, t4, i4, s4, r3) {
            return this._getFromCacheMap(this._cacheMapCombined, e4, t4, i4, s4, r3);
          }
          getRasterizedGlyph(e4, t4, i4, s4, r3) {
            return this._getFromCacheMap(this._cacheMap, e4, t4, i4, s4, r3);
          }
          _getFromCacheMap(e4, t4, i4, s4, r3, o3 = false) {
            return u2 = e4.get(t4, i4, s4, r3), u2 || (u2 = this._drawToCache(t4, i4, s4, r3, o3), e4.set(t4, i4, s4, r3, u2)), u2;
          }
          _getColorFromAnsiIndex(e4) {
            if (e4 >= this._config.colors.ansi.length) throw new Error("No color found for idx " + e4);
            return this._config.colors.ansi[e4];
          }
          _getBackgroundColor(e4, t4, i4, s4) {
            if (this._config.allowTransparency) return n2.NULL_COLOR;
            let r3;
            switch (e4) {
              case 16777216:
              case 33554432:
                r3 = this._getColorFromAnsiIndex(t4);
                break;
              case 50331648:
                const e5 = c2.AttributeData.toColorRGB(t4);
                r3 = n2.channels.toColor(e5[0], e5[1], e5[2]);
                break;
              default:
                r3 = i4 ? n2.color.opaque(this._config.colors.foreground) : this._config.colors.background;
            }
            return r3;
          }
          _getForegroundColor(e4, t4, i4, r3, o3, a3, h3, l3, d3, _3) {
            const u3 = this._getMinimumContrastColor(e4, t4, i4, r3, o3, a3, h3, d3, l3, _3);
            if (u3) return u3;
            let g3;
            switch (o3) {
              case 16777216:
              case 33554432:
                this._config.drawBoldTextInBrightColors && d3 && a3 < 8 && (a3 += 8), g3 = this._getColorFromAnsiIndex(a3);
                break;
              case 50331648:
                const e5 = c2.AttributeData.toColorRGB(a3);
                g3 = n2.channels.toColor(e5[0], e5[1], e5[2]);
                break;
              default:
                g3 = h3 ? this._config.colors.background : this._config.colors.foreground;
            }
            return this._config.allowTransparency && (g3 = n2.color.opaque(g3)), l3 && (g3 = n2.color.multiplyOpacity(g3, s3.DIM_OPACITY)), g3;
          }
          _resolveBackgroundRgba(e4, t4, i4) {
            switch (e4) {
              case 16777216:
              case 33554432:
                return this._getColorFromAnsiIndex(t4).rgba;
              case 50331648:
                return t4 << 8;
              default:
                return i4 ? this._config.colors.foreground.rgba : this._config.colors.background.rgba;
            }
          }
          _resolveForegroundRgba(e4, t4, i4, s4) {
            switch (e4) {
              case 16777216:
              case 33554432:
                return this._config.drawBoldTextInBrightColors && s4 && t4 < 8 && (t4 += 8), this._getColorFromAnsiIndex(t4).rgba;
              case 50331648:
                return t4 << 8;
              default:
                return i4 ? this._config.colors.background.rgba : this._config.colors.foreground.rgba;
            }
          }
          _getMinimumContrastColor(e4, t4, i4, s4, r3, o3, a3, h3, l3, c3) {
            if (1 === this._config.minimumContrastRatio || c3) return;
            const d3 = this._getContrastCache(l3), _3 = d3.getColor(e4, s4);
            if (void 0 !== _3) return _3 || void 0;
            const u3 = this._resolveBackgroundRgba(t4, i4, a3), g3 = this._resolveForegroundRgba(r3, o3, a3, h3), v3 = n2.rgba.ensureContrastRatio(u3, g3, this._config.minimumContrastRatio / (l3 ? 2 : 1));
            if (!v3) return void d3.setColor(e4, s4, null);
            const f3 = n2.channels.toColor(v3 >> 24 & 255, v3 >> 16 & 255, v3 >> 8 & 255);
            return d3.setColor(e4, s4, f3), f3;
          }
          _getContrastCache(e4) {
            return e4 ? this._config.colors.halfContrastCache : this._config.colors.contrastCache;
          }
          _drawToCache(e4, t4, i4, n3, a3 = false) {
            const h3 = "number" == typeof e4 ? String.fromCharCode(e4) : e4, l3 = Math.min(this._config.deviceCellWidth * Math.max(h3.length, 2) + 4, this._textureSize);
            this._tmpCanvas.width < l3 && (this._tmpCanvas.width = l3);
            const d3 = Math.min(this._config.deviceCellHeight + 8, this._textureSize);
            if (this._tmpCanvas.height < d3 && (this._tmpCanvas.height = d3), this._tmpCtx.save(), this._workAttributeData.fg = i4, this._workAttributeData.bg = t4, this._workAttributeData.extended.ext = n3, this._workAttributeData.isInvisible()) return _2;
            const u3 = !!this._workAttributeData.isBold(), v3 = !!this._workAttributeData.isInverse(), p3 = !!this._workAttributeData.isDim(), C2 = !!this._workAttributeData.isItalic(), m2 = !!this._workAttributeData.isUnderline(), L2 = !!this._workAttributeData.isStrikethrough(), x2 = !!this._workAttributeData.isOverline();
            let w2 = this._workAttributeData.getFgColor(), b2 = this._workAttributeData.getFgColorMode(), M2 = this._workAttributeData.getBgColor(), R2 = this._workAttributeData.getBgColorMode();
            if (v3) {
              const e5 = w2;
              w2 = M2, M2 = e5;
              const t5 = b2;
              b2 = R2, R2 = t5;
            }
            const y2 = this._getBackgroundColor(R2, M2, v3, p3);
            this._tmpCtx.globalCompositeOperation = "copy", this._tmpCtx.fillStyle = y2.css, this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height), this._tmpCtx.globalCompositeOperation = "source-over";
            const A2 = u3 ? this._config.fontWeightBold : this._config.fontWeight, E2 = C2 ? "italic" : "";
            this._tmpCtx.font = `${E2} ${A2} ${this._config.fontSize * this._config.devicePixelRatio}px ${this._config.fontFamily}`, this._tmpCtx.textBaseline = s3.TEXT_BASELINE;
            const S2 = 1 === h3.length && (0, o2.isPowerlineGlyph)(h3.charCodeAt(0)), T2 = 1 === h3.length && (0, o2.isRestrictedPowerlineGlyph)(h3.charCodeAt(0)), D2 = this._getForegroundColor(t4, R2, M2, i4, b2, w2, v3, p3, u3, (0, o2.treatGlyphAsBackgroundColor)(h3.charCodeAt(0)));
            this._tmpCtx.fillStyle = D2.css;
            const B2 = T2 ? 0 : 4;
            let F2 = false;
            false !== this._config.customGlyphs && (F2 = (0, r2.tryDrawCustomChar)(this._tmpCtx, h3, B2, B2, this._config.deviceCellWidth, this._config.deviceCellHeight, this._config.fontSize, this._config.devicePixelRatio));
            let P2, I2 = !S2;
            if (P2 = "number" == typeof e4 ? this._unicodeService.wcwidth(e4) : this._unicodeService.getStringCellWidth(e4), m2) {
              this._tmpCtx.save();
              const e5 = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15)), t5 = e5 % 2 == 1 ? 0.5 : 0;
              if (this._tmpCtx.lineWidth = e5, this._workAttributeData.isUnderlineColorDefault()) this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle;
              else if (this._workAttributeData.isUnderlineColorRGB()) I2 = false, this._tmpCtx.strokeStyle = `rgb(${c2.AttributeData.toColorRGB(this._workAttributeData.getUnderlineColor()).join(",")})`;
              else {
                I2 = false;
                let e6 = this._workAttributeData.getUnderlineColor();
                this._config.drawBoldTextInBrightColors && this._workAttributeData.isBold() && e6 < 8 && (e6 += 8), this._tmpCtx.strokeStyle = this._getColorFromAnsiIndex(e6).css;
              }
              this._tmpCtx.beginPath();
              const i5 = B2, s4 = Math.ceil(B2 + this._config.deviceCharHeight) - t5 - (a3 ? 2 * e5 : 0), r3 = s4 + e5, n4 = s4 + 2 * e5;
              let l4 = this._workAttributeData.getUnderlineVariantOffset();
              for (let a4 = 0; a4 < P2; a4++) {
                this._tmpCtx.save();
                const h4 = i5 + a4 * this._config.deviceCellWidth, c3 = i5 + (a4 + 1) * this._config.deviceCellWidth, d4 = h4 + this._config.deviceCellWidth / 2;
                switch (this._workAttributeData.extended.underlineStyle) {
                  case 2:
                    this._tmpCtx.moveTo(h4, s4), this._tmpCtx.lineTo(c3, s4), this._tmpCtx.moveTo(h4, n4), this._tmpCtx.lineTo(c3, n4);
                    break;
                  case 3:
                    const i6 = e5 <= 1 ? n4 : Math.ceil(B2 + this._config.deviceCharHeight - e5 / 2) - t5, a5 = e5 <= 1 ? s4 : Math.ceil(B2 + this._config.deviceCharHeight + e5 / 2) - t5, _3 = new Path2D();
                    _3.rect(h4, s4, this._config.deviceCellWidth, n4 - s4), this._tmpCtx.clip(_3), this._tmpCtx.moveTo(h4 - this._config.deviceCellWidth / 2, r3), this._tmpCtx.bezierCurveTo(h4 - this._config.deviceCellWidth / 2, a5, h4, a5, h4, r3), this._tmpCtx.bezierCurveTo(h4, i6, d4, i6, d4, r3), this._tmpCtx.bezierCurveTo(d4, a5, c3, a5, c3, r3), this._tmpCtx.bezierCurveTo(c3, i6, c3 + this._config.deviceCellWidth / 2, i6, c3 + this._config.deviceCellWidth / 2, r3);
                    break;
                  case 4:
                    const u4 = 0 === l4 ? 0 : l4 >= e5 ? 2 * e5 - l4 : e5 - l4;
                    false == !(l4 >= e5) || 0 === u4 ? (this._tmpCtx.setLineDash([Math.round(e5), Math.round(e5)]), this._tmpCtx.moveTo(h4 + u4, s4), this._tmpCtx.lineTo(c3, s4)) : (this._tmpCtx.setLineDash([Math.round(e5), Math.round(e5)]), this._tmpCtx.moveTo(h4, s4), this._tmpCtx.lineTo(h4 + u4, s4), this._tmpCtx.moveTo(h4 + u4 + e5, s4), this._tmpCtx.lineTo(c3, s4)), l4 = (0, o2.computeNextVariantOffset)(c3 - h4, e5, l4);
                    break;
                  case 5:
                    const g3 = 0.6, v4 = 0.3, f3 = c3 - h4, p4 = Math.floor(g3 * f3), C3 = Math.floor(v4 * f3), m3 = f3 - p4 - C3;
                    this._tmpCtx.setLineDash([p4, C3, m3]), this._tmpCtx.moveTo(h4, s4), this._tmpCtx.lineTo(c3, s4);
                    break;
                  default:
                    this._tmpCtx.moveTo(h4, s4), this._tmpCtx.lineTo(c3, s4);
                }
                this._tmpCtx.stroke(), this._tmpCtx.restore();
              }
              if (this._tmpCtx.restore(), !F2 && this._config.fontSize >= 12 && !this._config.allowTransparency && " " !== h3) {
                this._tmpCtx.save(), this._tmpCtx.textBaseline = "alphabetic";
                const t6 = this._tmpCtx.measureText(h3);
                if (this._tmpCtx.restore(), "actualBoundingBoxDescent" in t6 && t6.actualBoundingBoxDescent > 0) {
                  this._tmpCtx.save();
                  const t7 = new Path2D();
                  t7.rect(i5, s4 - Math.ceil(e5 / 2), this._config.deviceCellWidth * P2, n4 - s4 + Math.ceil(e5 / 2)), this._tmpCtx.clip(t7), this._tmpCtx.lineWidth = 3 * this._config.devicePixelRatio, this._tmpCtx.strokeStyle = y2.css, this._tmpCtx.strokeText(h3, B2, B2 + this._config.deviceCharHeight), this._tmpCtx.restore();
                }
              }
            }
            if (x2) {
              const e5 = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15)), t5 = e5 % 2 == 1 ? 0.5 : 0;
              this._tmpCtx.lineWidth = e5, this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle, this._tmpCtx.beginPath(), this._tmpCtx.moveTo(B2, B2 + t5), this._tmpCtx.lineTo(B2 + this._config.deviceCharWidth * P2, B2 + t5), this._tmpCtx.stroke();
            }
            if (F2 || this._tmpCtx.fillText(h3, B2, B2 + this._config.deviceCharHeight), "_" === h3 && !this._config.allowTransparency) {
              let e5 = f2(this._tmpCtx.getImageData(B2, B2, this._config.deviceCellWidth, this._config.deviceCellHeight), y2, D2, I2);
              if (e5) for (let t5 = 1; t5 <= 5 && (this._tmpCtx.save(), this._tmpCtx.fillStyle = y2.css, this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height), this._tmpCtx.restore(), this._tmpCtx.fillText(h3, B2, B2 + this._config.deviceCharHeight - t5), e5 = f2(this._tmpCtx.getImageData(B2, B2, this._config.deviceCellWidth, this._config.deviceCellHeight), y2, D2, I2), e5); t5++) ;
            }
            if (L2) {
              const e5 = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 10)), t5 = this._tmpCtx.lineWidth % 2 == 1 ? 0.5 : 0;
              this._tmpCtx.lineWidth = e5, this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle, this._tmpCtx.beginPath(), this._tmpCtx.moveTo(B2, B2 + Math.floor(this._config.deviceCharHeight / 2) - t5), this._tmpCtx.lineTo(B2 + this._config.deviceCharWidth * P2, B2 + Math.floor(this._config.deviceCharHeight / 2) - t5), this._tmpCtx.stroke();
            }
            this._tmpCtx.restore();
            const O2 = this._tmpCtx.getImageData(0, 0, this._tmpCanvas.width, this._tmpCanvas.height);
            let k2;
            if (k2 = this._config.allowTransparency ? (function(e5) {
              for (let t5 = 0; t5 < e5.data.length; t5 += 4) if (e5.data[t5 + 3] > 0) return false;
              return true;
            })(O2) : f2(O2, y2, D2, I2), k2) return _2;
            const $2 = this._findGlyphBoundingBox(O2, this._workBoundingBox, l3, T2, F2, B2);
            let U2, N2;
            for (; ; ) {
              if (0 === this._activePages.length) {
                const e5 = this._createNewPage();
                U2 = e5, N2 = e5.currentRow, N2.height = $2.size.y;
                break;
              }
              U2 = this._activePages[this._activePages.length - 1], N2 = U2.currentRow;
              for (const e5 of this._activePages) $2.size.y <= e5.currentRow.height && (U2 = e5, N2 = e5.currentRow);
              for (let e5 = this._activePages.length - 1; e5 >= 0; e5--) for (const t5 of this._activePages[e5].fixedRows) t5.height <= N2.height && $2.size.y <= t5.height && (U2 = this._activePages[e5], N2 = t5);
              if (N2.y + $2.size.y >= U2.canvas.height || N2.height > $2.size.y + 2) {
                let e5 = false;
                if (U2.currentRow.y + U2.currentRow.height + $2.size.y >= U2.canvas.height) {
                  let t5;
                  for (const e6 of this._activePages) if (e6.currentRow.y + e6.currentRow.height + $2.size.y < e6.canvas.height) {
                    t5 = e6;
                    break;
                  }
                  if (t5) U2 = t5;
                  else if (g2.maxAtlasPages && this._pages.length >= g2.maxAtlasPages && N2.y + $2.size.y <= U2.canvas.height && N2.height >= $2.size.y && N2.x + $2.size.x <= U2.canvas.width) e5 = true;
                  else {
                    const t6 = this._createNewPage();
                    U2 = t6, N2 = t6.currentRow, N2.height = $2.size.y, e5 = true;
                  }
                }
                e5 || (U2.currentRow.height > 0 && U2.fixedRows.push(U2.currentRow), N2 = { x: 0, y: U2.currentRow.y + U2.currentRow.height, height: $2.size.y }, U2.fixedRows.push(N2), U2.currentRow = { x: 0, y: N2.y + N2.height, height: 0 });
              }
              if (N2.x + $2.size.x <= U2.canvas.width) break;
              N2 === U2.currentRow ? (N2.x = 0, N2.y += N2.height, N2.height = 0) : U2.fixedRows.splice(U2.fixedRows.indexOf(N2), 1);
            }
            return $2.texturePage = this._pages.indexOf(U2), $2.texturePosition.x = N2.x, $2.texturePosition.y = N2.y, $2.texturePositionClipSpace.x = N2.x / U2.canvas.width, $2.texturePositionClipSpace.y = N2.y / U2.canvas.height, $2.sizeClipSpace.x /= U2.canvas.width, $2.sizeClipSpace.y /= U2.canvas.height, N2.height = Math.max(N2.height, $2.size.y), N2.x += $2.size.x, U2.ctx.putImageData(O2, $2.texturePosition.x - this._workBoundingBox.left, $2.texturePosition.y - this._workBoundingBox.top, this._workBoundingBox.left, this._workBoundingBox.top, $2.size.x, $2.size.y), U2.addGlyph($2), U2.version++, $2;
          }
          _findGlyphBoundingBox(e4, t4, i4, s4, r3, o3) {
            t4.top = 0;
            const n3 = s4 ? this._config.deviceCellHeight : this._tmpCanvas.height, a3 = s4 ? this._config.deviceCellWidth : i4;
            let h3 = false;
            for (let i5 = 0; i5 < n3; i5++) {
              for (let s5 = 0; s5 < a3; s5++) {
                const r4 = i5 * this._tmpCanvas.width * 4 + 4 * s5 + 3;
                if (0 !== e4.data[r4]) {
                  t4.top = i5, h3 = true;
                  break;
                }
              }
              if (h3) break;
            }
            t4.left = 0, h3 = false;
            for (let i5 = 0; i5 < o3 + a3; i5++) {
              for (let s5 = 0; s5 < n3; s5++) {
                const r4 = s5 * this._tmpCanvas.width * 4 + 4 * i5 + 3;
                if (0 !== e4.data[r4]) {
                  t4.left = i5, h3 = true;
                  break;
                }
              }
              if (h3) break;
            }
            t4.right = a3, h3 = false;
            for (let i5 = o3 + a3 - 1; i5 >= o3; i5--) {
              for (let s5 = 0; s5 < n3; s5++) {
                const r4 = s5 * this._tmpCanvas.width * 4 + 4 * i5 + 3;
                if (0 !== e4.data[r4]) {
                  t4.right = i5, h3 = true;
                  break;
                }
              }
              if (h3) break;
            }
            t4.bottom = n3, h3 = false;
            for (let i5 = n3 - 1; i5 >= 0; i5--) {
              for (let s5 = 0; s5 < a3; s5++) {
                const r4 = i5 * this._tmpCanvas.width * 4 + 4 * s5 + 3;
                if (0 !== e4.data[r4]) {
                  t4.bottom = i5, h3 = true;
                  break;
                }
              }
              if (h3) break;
            }
            return { texturePage: 0, texturePosition: { x: 0, y: 0 }, texturePositionClipSpace: { x: 0, y: 0 }, size: { x: t4.right - t4.left + 1, y: t4.bottom - t4.top + 1 }, sizeClipSpace: { x: t4.right - t4.left + 1, y: t4.bottom - t4.top + 1 }, offset: { x: -t4.left + o3 + (s4 || r3 ? Math.floor((this._config.deviceCellWidth - this._config.deviceCharWidth) / 2) : 0), y: -t4.top + o3 + (s4 || r3 ? 1 === this._config.lineHeight ? 0 : Math.round((this._config.deviceCellHeight - this._config.deviceCharHeight) / 2) : 0) } };
          }
        }
        t3.TextureAtlas = g2;
        class v2 {
          get percentageUsed() {
            return this._usedPixels / (this.canvas.width * this.canvas.height);
          }
          get glyphs() {
            return this._glyphs;
          }
          addGlyph(e4) {
            this._glyphs.push(e4), this._usedPixels += e4.size.x * e4.size.y;
          }
          constructor(e4, t4, i4) {
            if (this._usedPixels = 0, this._glyphs = [], this.version = 0, this.currentRow = { x: 0, y: 0, height: 0 }, this.fixedRows = [], i4) for (const e5 of i4) this._glyphs.push(...e5.glyphs), this._usedPixels += e5._usedPixels;
            this.canvas = p2(e4, t4, t4), this.ctx = (0, o2.throwIfFalsy)(this.canvas.getContext("2d", { alpha: true }));
          }
          clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.currentRow.x = 0, this.currentRow.y = 0, this.currentRow.height = 0, this.fixedRows.length = 0, this.version++;
          }
        }
        function f2(e4, t4, i4, s4) {
          const r3 = t4.rgba >>> 24, o3 = t4.rgba >>> 16 & 255, n3 = t4.rgba >>> 8 & 255, a3 = i4.rgba >>> 24, h3 = i4.rgba >>> 16 & 255, l3 = i4.rgba >>> 8 & 255, c3 = Math.floor((Math.abs(r3 - a3) + Math.abs(o3 - h3) + Math.abs(n3 - l3)) / 12);
          let d3 = true;
          for (let t5 = 0; t5 < e4.data.length; t5 += 4) e4.data[t5] === r3 && e4.data[t5 + 1] === o3 && e4.data[t5 + 2] === n3 || s4 && Math.abs(e4.data[t5] - r3) + Math.abs(e4.data[t5 + 1] - o3) + Math.abs(e4.data[t5 + 2] - n3) < c3 ? e4.data[t5 + 3] = 0 : d3 = false;
          return d3;
        }
        function p2(e4, t4, i4) {
          const s4 = e4.createElement("canvas");
          return s4.width = t4, s4.height = i4, s4;
        }
      }, 160: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.contrastRatio = t3.toPaddedHex = t3.rgba = t3.rgb = t3.css = t3.color = t3.channels = t3.NULL_COLOR = void 0;
        const s3 = i3(399);
        let r2 = 0, o2 = 0, n2 = 0, a2 = 0;
        var h2, l2, c2, d2, _2;
        function u2(e4) {
          const t4 = e4.toString(16);
          return t4.length < 2 ? "0" + t4 : t4;
        }
        function g2(e4, t4) {
          return e4 < t4 ? (t4 + 0.05) / (e4 + 0.05) : (e4 + 0.05) / (t4 + 0.05);
        }
        t3.NULL_COLOR = { css: "#00000000", rgba: 0 }, (function(e4) {
          e4.toCss = function(e5, t4, i4, s4) {
            return void 0 !== s4 ? `#${u2(e5)}${u2(t4)}${u2(i4)}${u2(s4)}` : `#${u2(e5)}${u2(t4)}${u2(i4)}`;
          }, e4.toRgba = function(e5, t4, i4, s4 = 255) {
            return (e5 << 24 | t4 << 16 | i4 << 8 | s4) >>> 0;
          }, e4.toColor = function(t4, i4, s4, r3) {
            return { css: e4.toCss(t4, i4, s4, r3), rgba: e4.toRgba(t4, i4, s4, r3) };
          };
        })(h2 || (t3.channels = h2 = {})), (function(e4) {
          function t4(e5, t5) {
            return a2 = Math.round(255 * t5), [r2, o2, n2] = _2.toChannels(e5.rgba), { css: h2.toCss(r2, o2, n2, a2), rgba: h2.toRgba(r2, o2, n2, a2) };
          }
          e4.blend = function(e5, t5) {
            if (a2 = (255 & t5.rgba) / 255, 1 === a2) return { css: t5.css, rgba: t5.rgba };
            const i4 = t5.rgba >> 24 & 255, s4 = t5.rgba >> 16 & 255, l3 = t5.rgba >> 8 & 255, c3 = e5.rgba >> 24 & 255, d3 = e5.rgba >> 16 & 255, _3 = e5.rgba >> 8 & 255;
            return r2 = c3 + Math.round((i4 - c3) * a2), o2 = d3 + Math.round((s4 - d3) * a2), n2 = _3 + Math.round((l3 - _3) * a2), { css: h2.toCss(r2, o2, n2), rgba: h2.toRgba(r2, o2, n2) };
          }, e4.isOpaque = function(e5) {
            return 255 == (255 & e5.rgba);
          }, e4.ensureContrastRatio = function(e5, t5, i4) {
            const s4 = _2.ensureContrastRatio(e5.rgba, t5.rgba, i4);
            if (s4) return h2.toColor(s4 >> 24 & 255, s4 >> 16 & 255, s4 >> 8 & 255);
          }, e4.opaque = function(e5) {
            const t5 = (255 | e5.rgba) >>> 0;
            return [r2, o2, n2] = _2.toChannels(t5), { css: h2.toCss(r2, o2, n2), rgba: t5 };
          }, e4.opacity = t4, e4.multiplyOpacity = function(e5, i4) {
            return a2 = 255 & e5.rgba, t4(e5, a2 * i4 / 255);
          }, e4.toColorRGB = function(e5) {
            return [e5.rgba >> 24 & 255, e5.rgba >> 16 & 255, e5.rgba >> 8 & 255];
          };
        })(l2 || (t3.color = l2 = {})), (function(e4) {
          let t4, i4;
          if (!s3.isNode) {
            const e5 = document.createElement("canvas");
            e5.width = 1, e5.height = 1;
            const s4 = e5.getContext("2d", { willReadFrequently: true });
            s4 && (t4 = s4, t4.globalCompositeOperation = "copy", i4 = t4.createLinearGradient(0, 0, 1, 1));
          }
          e4.toColor = function(e5) {
            if (e5.match(/#[\da-f]{3,8}/i)) switch (e5.length) {
              case 4:
                return r2 = parseInt(e5.slice(1, 2).repeat(2), 16), o2 = parseInt(e5.slice(2, 3).repeat(2), 16), n2 = parseInt(e5.slice(3, 4).repeat(2), 16), h2.toColor(r2, o2, n2);
              case 5:
                return r2 = parseInt(e5.slice(1, 2).repeat(2), 16), o2 = parseInt(e5.slice(2, 3).repeat(2), 16), n2 = parseInt(e5.slice(3, 4).repeat(2), 16), a2 = parseInt(e5.slice(4, 5).repeat(2), 16), h2.toColor(r2, o2, n2, a2);
              case 7:
                return { css: e5, rgba: (parseInt(e5.slice(1), 16) << 8 | 255) >>> 0 };
              case 9:
                return { css: e5, rgba: parseInt(e5.slice(1), 16) >>> 0 };
            }
            const s4 = e5.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
            if (s4) return r2 = parseInt(s4[1]), o2 = parseInt(s4[2]), n2 = parseInt(s4[3]), a2 = Math.round(255 * (void 0 === s4[5] ? 1 : parseFloat(s4[5]))), h2.toColor(r2, o2, n2, a2);
            if (!t4 || !i4) throw new Error("css.toColor: Unsupported css format");
            if (t4.fillStyle = i4, t4.fillStyle = e5, "string" != typeof t4.fillStyle) throw new Error("css.toColor: Unsupported css format");
            if (t4.fillRect(0, 0, 1, 1), [r2, o2, n2, a2] = t4.getImageData(0, 0, 1, 1).data, 255 !== a2) throw new Error("css.toColor: Unsupported css format");
            return { rgba: h2.toRgba(r2, o2, n2, a2), css: e5 };
          };
        })(c2 || (t3.css = c2 = {})), (function(e4) {
          function t4(e5, t5, i4) {
            const s4 = e5 / 255, r3 = t5 / 255, o3 = i4 / 255;
            return 0.2126 * (s4 <= 0.03928 ? s4 / 12.92 : Math.pow((s4 + 0.055) / 1.055, 2.4)) + 0.7152 * (r3 <= 0.03928 ? r3 / 12.92 : Math.pow((r3 + 0.055) / 1.055, 2.4)) + 0.0722 * (o3 <= 0.03928 ? o3 / 12.92 : Math.pow((o3 + 0.055) / 1.055, 2.4));
          }
          e4.relativeLuminance = function(e5) {
            return t4(e5 >> 16 & 255, e5 >> 8 & 255, 255 & e5);
          }, e4.relativeLuminance2 = t4;
        })(d2 || (t3.rgb = d2 = {})), (function(e4) {
          function t4(e5, t5, i5) {
            const s4 = e5 >> 24 & 255, r3 = e5 >> 16 & 255, o3 = e5 >> 8 & 255;
            let n3 = t5 >> 24 & 255, a3 = t5 >> 16 & 255, h3 = t5 >> 8 & 255, l3 = g2(d2.relativeLuminance2(n3, a3, h3), d2.relativeLuminance2(s4, r3, o3));
            for (; l3 < i5 && (n3 > 0 || a3 > 0 || h3 > 0); ) n3 -= Math.max(0, Math.ceil(0.1 * n3)), a3 -= Math.max(0, Math.ceil(0.1 * a3)), h3 -= Math.max(0, Math.ceil(0.1 * h3)), l3 = g2(d2.relativeLuminance2(n3, a3, h3), d2.relativeLuminance2(s4, r3, o3));
            return (n3 << 24 | a3 << 16 | h3 << 8 | 255) >>> 0;
          }
          function i4(e5, t5, i5) {
            const s4 = e5 >> 24 & 255, r3 = e5 >> 16 & 255, o3 = e5 >> 8 & 255;
            let n3 = t5 >> 24 & 255, a3 = t5 >> 16 & 255, h3 = t5 >> 8 & 255, l3 = g2(d2.relativeLuminance2(n3, a3, h3), d2.relativeLuminance2(s4, r3, o3));
            for (; l3 < i5 && (n3 < 255 || a3 < 255 || h3 < 255); ) n3 = Math.min(255, n3 + Math.ceil(0.1 * (255 - n3))), a3 = Math.min(255, a3 + Math.ceil(0.1 * (255 - a3))), h3 = Math.min(255, h3 + Math.ceil(0.1 * (255 - h3))), l3 = g2(d2.relativeLuminance2(n3, a3, h3), d2.relativeLuminance2(s4, r3, o3));
            return (n3 << 24 | a3 << 16 | h3 << 8 | 255) >>> 0;
          }
          e4.blend = function(e5, t5) {
            if (a2 = (255 & t5) / 255, 1 === a2) return t5;
            const i5 = t5 >> 24 & 255, s4 = t5 >> 16 & 255, l3 = t5 >> 8 & 255, c3 = e5 >> 24 & 255, d3 = e5 >> 16 & 255, _3 = e5 >> 8 & 255;
            return r2 = c3 + Math.round((i5 - c3) * a2), o2 = d3 + Math.round((s4 - d3) * a2), n2 = _3 + Math.round((l3 - _3) * a2), h2.toRgba(r2, o2, n2);
          }, e4.ensureContrastRatio = function(e5, s4, r3) {
            const o3 = d2.relativeLuminance(e5 >> 8), n3 = d2.relativeLuminance(s4 >> 8);
            if (g2(o3, n3) < r3) {
              if (n3 < o3) {
                const n4 = t4(e5, s4, r3), a4 = g2(o3, d2.relativeLuminance(n4 >> 8));
                if (a4 < r3) {
                  const t5 = i4(e5, s4, r3);
                  return a4 > g2(o3, d2.relativeLuminance(t5 >> 8)) ? n4 : t5;
                }
                return n4;
              }
              const a3 = i4(e5, s4, r3), h3 = g2(o3, d2.relativeLuminance(a3 >> 8));
              if (h3 < r3) {
                const i5 = t4(e5, s4, r3);
                return h3 > g2(o3, d2.relativeLuminance(i5 >> 8)) ? a3 : i5;
              }
              return a3;
            }
          }, e4.reduceLuminance = t4, e4.increaseLuminance = i4, e4.toChannels = function(e5) {
            return [e5 >> 24 & 255, e5 >> 16 & 255, e5 >> 8 & 255, 255 & e5];
          };
        })(_2 || (t3.rgba = _2 = {})), t3.toPaddedHex = u2, t3.contrastRatio = g2;
      }, 345: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.runAndSubscribe = t3.forwardEvent = t3.EventEmitter = void 0, t3.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e4) => (this._listeners.push(e4), { dispose: () => {
              if (!this._disposed) {
                for (let t4 = 0; t4 < this._listeners.length; t4++) if (this._listeners[t4] === e4) return void this._listeners.splice(t4, 1);
              }
            } })), this._event;
          }
          fire(e4, t4) {
            const i3 = [];
            for (let e5 = 0; e5 < this._listeners.length; e5++) i3.push(this._listeners[e5]);
            for (let s3 = 0; s3 < i3.length; s3++) i3[s3].call(void 0, e4, t4);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t3.forwardEvent = function(e4, t4) {
          return e4(((e5) => t4.fire(e5)));
        }, t3.runAndSubscribe = function(e4, t4) {
          return t4(void 0), e4(((e5) => t4(e5)));
        };
      }, 859: (e3, t3) => {
        function i3(e4) {
          for (const t4 of e4) t4.dispose();
          e4.length = 0;
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.getDisposeArrayDisposable = t3.disposeArray = t3.toDisposable = t3.MutableDisposable = t3.Disposable = void 0, t3.Disposable = class {
          constructor() {
            this._disposables = [], this._isDisposed = false;
          }
          dispose() {
            this._isDisposed = true;
            for (const e4 of this._disposables) e4.dispose();
            this._disposables.length = 0;
          }
          register(e4) {
            return this._disposables.push(e4), e4;
          }
          unregister(e4) {
            const t4 = this._disposables.indexOf(e4);
            -1 !== t4 && this._disposables.splice(t4, 1);
          }
        }, t3.MutableDisposable = class {
          constructor() {
            this._isDisposed = false;
          }
          get value() {
            return this._isDisposed ? void 0 : this._value;
          }
          set value(e4) {
            this._isDisposed || e4 === this._value || (this._value?.dispose(), this._value = e4);
          }
          clear() {
            this.value = void 0;
          }
          dispose() {
            this._isDisposed = true, this._value?.dispose(), this._value = void 0;
          }
        }, t3.toDisposable = function(e4) {
          return { dispose: e4 };
        }, t3.disposeArray = i3, t3.getDisposeArrayDisposable = function(e4) {
          return { dispose: () => i3(e4) };
        };
      }, 485: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.FourKeyMap = t3.TwoKeyMap = void 0;
        class i3 {
          constructor() {
            this._data = {};
          }
          set(e4, t4, i4) {
            this._data[e4] || (this._data[e4] = {}), this._data[e4][t4] = i4;
          }
          get(e4, t4) {
            return this._data[e4] ? this._data[e4][t4] : void 0;
          }
          clear() {
            this._data = {};
          }
        }
        t3.TwoKeyMap = i3, t3.FourKeyMap = class {
          constructor() {
            this._data = new i3();
          }
          set(e4, t4, s3, r2, o2) {
            this._data.get(e4, t4) || this._data.set(e4, t4, new i3()), this._data.get(e4, t4).set(s3, r2, o2);
          }
          get(e4, t4, i4, s3) {
            return this._data.get(e4, t4)?.get(i4, s3);
          }
          clear() {
            this._data.clear();
          }
        };
      }, 399: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.isChromeOS = t3.isLinux = t3.isWindows = t3.isIphone = t3.isIpad = t3.isMac = t3.getSafariVersion = t3.isSafari = t3.isLegacyEdge = t3.isFirefox = t3.isNode = void 0, t3.isNode = "undefined" != typeof process;
        const i3 = t3.isNode ? "node" : navigator.userAgent, s3 = t3.isNode ? "node" : navigator.platform;
        t3.isFirefox = i3.includes("Firefox"), t3.isLegacyEdge = i3.includes("Edge"), t3.isSafari = /^((?!chrome|android).)*safari/i.test(i3), t3.getSafariVersion = function() {
          if (!t3.isSafari) return 0;
          const e4 = i3.match(/Version\/(\d+)/);
          return null === e4 || e4.length < 2 ? 0 : parseInt(e4[1]);
        }, t3.isMac = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"].includes(s3), t3.isIpad = "iPad" === s3, t3.isIphone = "iPhone" === s3, t3.isWindows = ["Windows", "Win16", "Win32", "WinCE"].includes(s3), t3.isLinux = s3.indexOf("Linux") >= 0, t3.isChromeOS = /\bCrOS\b/.test(i3);
      }, 385: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.DebouncedIdleTask = t3.IdleTaskQueue = t3.PriorityTaskQueue = void 0;
        const s3 = i3(399);
        class r2 {
          constructor() {
            this._tasks = [], this._i = 0;
          }
          enqueue(e4) {
            this._tasks.push(e4), this._start();
          }
          flush() {
            for (; this._i < this._tasks.length; ) this._tasks[this._i]() || this._i++;
            this.clear();
          }
          clear() {
            this._idleCallback && (this._cancelCallback(this._idleCallback), this._idleCallback = void 0), this._i = 0, this._tasks.length = 0;
          }
          _start() {
            this._idleCallback || (this._idleCallback = this._requestCallback(this._process.bind(this)));
          }
          _process(e4) {
            this._idleCallback = void 0;
            let t4 = 0, i4 = 0, s4 = e4.timeRemaining(), r3 = 0;
            for (; this._i < this._tasks.length; ) {
              if (t4 = Date.now(), this._tasks[this._i]() || this._i++, t4 = Math.max(1, Date.now() - t4), i4 = Math.max(t4, i4), r3 = e4.timeRemaining(), 1.5 * i4 > r3) return s4 - t4 < -20 && console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(s4 - t4))}ms`), void this._start();
              s4 = r3;
            }
            this.clear();
          }
        }
        class o2 extends r2 {
          _requestCallback(e4) {
            return setTimeout((() => e4(this._createDeadline(16))));
          }
          _cancelCallback(e4) {
            clearTimeout(e4);
          }
          _createDeadline(e4) {
            const t4 = Date.now() + e4;
            return { timeRemaining: () => Math.max(0, t4 - Date.now()) };
          }
        }
        t3.PriorityTaskQueue = o2, t3.IdleTaskQueue = !s3.isNode && "requestIdleCallback" in window ? class extends r2 {
          _requestCallback(e4) {
            return requestIdleCallback(e4);
          }
          _cancelCallback(e4) {
            cancelIdleCallback(e4);
          }
        } : o2, t3.DebouncedIdleTask = class {
          constructor() {
            this._queue = new t3.IdleTaskQueue();
          }
          set(e4) {
            this._queue.clear(), this._queue.enqueue(e4);
          }
          flush() {
            this._queue.flush();
          }
        };
      }, 147: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.ExtendedAttrs = t3.AttributeData = void 0;
        class i3 {
          constructor() {
            this.fg = 0, this.bg = 0, this.extended = new s3();
          }
          static toColorRGB(e4) {
            return [e4 >>> 16 & 255, e4 >>> 8 & 255, 255 & e4];
          }
          static fromColorRGB(e4) {
            return (255 & e4[0]) << 16 | (255 & e4[1]) << 8 | 255 & e4[2];
          }
          clone() {
            const e4 = new i3();
            return e4.fg = this.fg, e4.bg = this.bg, e4.extended = this.extended.clone(), e4;
          }
          isInverse() {
            return 67108864 & this.fg;
          }
          isBold() {
            return 134217728 & this.fg;
          }
          isUnderline() {
            return this.hasExtendedAttrs() && 0 !== this.extended.underlineStyle ? 1 : 268435456 & this.fg;
          }
          isBlink() {
            return 536870912 & this.fg;
          }
          isInvisible() {
            return 1073741824 & this.fg;
          }
          isItalic() {
            return 67108864 & this.bg;
          }
          isDim() {
            return 134217728 & this.bg;
          }
          isStrikethrough() {
            return 2147483648 & this.fg;
          }
          isProtected() {
            return 536870912 & this.bg;
          }
          isOverline() {
            return 1073741824 & this.bg;
          }
          getFgColorMode() {
            return 50331648 & this.fg;
          }
          getBgColorMode() {
            return 50331648 & this.bg;
          }
          isFgRGB() {
            return 50331648 == (50331648 & this.fg);
          }
          isBgRGB() {
            return 50331648 == (50331648 & this.bg);
          }
          isFgPalette() {
            return 16777216 == (50331648 & this.fg) || 33554432 == (50331648 & this.fg);
          }
          isBgPalette() {
            return 16777216 == (50331648 & this.bg) || 33554432 == (50331648 & this.bg);
          }
          isFgDefault() {
            return 0 == (50331648 & this.fg);
          }
          isBgDefault() {
            return 0 == (50331648 & this.bg);
          }
          isAttributeDefault() {
            return 0 === this.fg && 0 === this.bg;
          }
          getFgColor() {
            switch (50331648 & this.fg) {
              case 16777216:
              case 33554432:
                return 255 & this.fg;
              case 50331648:
                return 16777215 & this.fg;
              default:
                return -1;
            }
          }
          getBgColor() {
            switch (50331648 & this.bg) {
              case 16777216:
              case 33554432:
                return 255 & this.bg;
              case 50331648:
                return 16777215 & this.bg;
              default:
                return -1;
            }
          }
          hasExtendedAttrs() {
            return 268435456 & this.bg;
          }
          updateExtended() {
            this.extended.isEmpty() ? this.bg &= -268435457 : this.bg |= 268435456;
          }
          getUnderlineColor() {
            if (268435456 & this.bg && ~this.extended.underlineColor) switch (50331648 & this.extended.underlineColor) {
              case 16777216:
              case 33554432:
                return 255 & this.extended.underlineColor;
              case 50331648:
                return 16777215 & this.extended.underlineColor;
              default:
                return this.getFgColor();
            }
            return this.getFgColor();
          }
          getUnderlineColorMode() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 & this.extended.underlineColor : this.getFgColorMode();
          }
          isUnderlineColorRGB() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 50331648 == (50331648 & this.extended.underlineColor) : this.isFgRGB();
          }
          isUnderlineColorPalette() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 16777216 == (50331648 & this.extended.underlineColor) || 33554432 == (50331648 & this.extended.underlineColor) : this.isFgPalette();
          }
          isUnderlineColorDefault() {
            return 268435456 & this.bg && ~this.extended.underlineColor ? 0 == (50331648 & this.extended.underlineColor) : this.isFgDefault();
          }
          getUnderlineStyle() {
            return 268435456 & this.fg ? 268435456 & this.bg ? this.extended.underlineStyle : 1 : 0;
          }
          getUnderlineVariantOffset() {
            return this.extended.underlineVariantOffset;
          }
        }
        t3.AttributeData = i3;
        class s3 {
          get ext() {
            return this._urlId ? -469762049 & this._ext | this.underlineStyle << 26 : this._ext;
          }
          set ext(e4) {
            this._ext = e4;
          }
          get underlineStyle() {
            return this._urlId ? 5 : (469762048 & this._ext) >> 26;
          }
          set underlineStyle(e4) {
            this._ext &= -469762049, this._ext |= e4 << 26 & 469762048;
          }
          get underlineColor() {
            return 67108863 & this._ext;
          }
          set underlineColor(e4) {
            this._ext &= -67108864, this._ext |= 67108863 & e4;
          }
          get urlId() {
            return this._urlId;
          }
          set urlId(e4) {
            this._urlId = e4;
          }
          get underlineVariantOffset() {
            const e4 = (3758096384 & this._ext) >> 29;
            return e4 < 0 ? 4294967288 ^ e4 : e4;
          }
          set underlineVariantOffset(e4) {
            this._ext &= 536870911, this._ext |= e4 << 29 & 3758096384;
          }
          constructor(e4 = 0, t4 = 0) {
            this._ext = 0, this._urlId = 0, this._ext = e4, this._urlId = t4;
          }
          clone() {
            return new s3(this._ext, this._urlId);
          }
          isEmpty() {
            return 0 === this.underlineStyle && 0 === this._urlId;
          }
        }
        t3.ExtendedAttrs = s3;
      }, 782: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.CellData = void 0;
        const s3 = i3(133), r2 = i3(855), o2 = i3(147);
        class n2 extends o2.AttributeData {
          constructor() {
            super(...arguments), this.content = 0, this.fg = 0, this.bg = 0, this.extended = new o2.ExtendedAttrs(), this.combinedData = "";
          }
          static fromCharData(e4) {
            const t4 = new n2();
            return t4.setFromCharData(e4), t4;
          }
          isCombined() {
            return 2097152 & this.content;
          }
          getWidth() {
            return this.content >> 22;
          }
          getChars() {
            return 2097152 & this.content ? this.combinedData : 2097151 & this.content ? (0, s3.stringFromCodePoint)(2097151 & this.content) : "";
          }
          getCode() {
            return this.isCombined() ? this.combinedData.charCodeAt(this.combinedData.length - 1) : 2097151 & this.content;
          }
          setFromCharData(e4) {
            this.fg = e4[r2.CHAR_DATA_ATTR_INDEX], this.bg = 0;
            let t4 = false;
            if (e4[r2.CHAR_DATA_CHAR_INDEX].length > 2) t4 = true;
            else if (2 === e4[r2.CHAR_DATA_CHAR_INDEX].length) {
              const i4 = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
              if (55296 <= i4 && i4 <= 56319) {
                const s4 = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                56320 <= s4 && s4 <= 57343 ? this.content = 1024 * (i4 - 55296) + s4 - 56320 + 65536 | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22 : t4 = true;
              } else t4 = true;
            } else this.content = e4[r2.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22;
            t4 && (this.combinedData = e4[r2.CHAR_DATA_CHAR_INDEX], this.content = 2097152 | e4[r2.CHAR_DATA_WIDTH_INDEX] << 22);
          }
          getAsCharData() {
            return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
          }
        }
        t3.CellData = n2;
      }, 855: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.WHITESPACE_CELL_CODE = t3.WHITESPACE_CELL_WIDTH = t3.WHITESPACE_CELL_CHAR = t3.NULL_CELL_CODE = t3.NULL_CELL_WIDTH = t3.NULL_CELL_CHAR = t3.CHAR_DATA_CODE_INDEX = t3.CHAR_DATA_WIDTH_INDEX = t3.CHAR_DATA_CHAR_INDEX = t3.CHAR_DATA_ATTR_INDEX = t3.DEFAULT_EXT = t3.DEFAULT_ATTR = t3.DEFAULT_COLOR = void 0, t3.DEFAULT_COLOR = 0, t3.DEFAULT_ATTR = 256 | t3.DEFAULT_COLOR << 9, t3.DEFAULT_EXT = 0, t3.CHAR_DATA_ATTR_INDEX = 0, t3.CHAR_DATA_CHAR_INDEX = 1, t3.CHAR_DATA_WIDTH_INDEX = 2, t3.CHAR_DATA_CODE_INDEX = 3, t3.NULL_CELL_CHAR = "", t3.NULL_CELL_WIDTH = 1, t3.NULL_CELL_CODE = 0, t3.WHITESPACE_CELL_CHAR = " ", t3.WHITESPACE_CELL_WIDTH = 1, t3.WHITESPACE_CELL_CODE = 32;
      }, 133: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.Utf8ToUtf32 = t3.StringToUtf32 = t3.utf32ToString = t3.stringFromCodePoint = void 0, t3.stringFromCodePoint = function(e4) {
          return e4 > 65535 ? (e4 -= 65536, String.fromCharCode(55296 + (e4 >> 10)) + String.fromCharCode(e4 % 1024 + 56320)) : String.fromCharCode(e4);
        }, t3.utf32ToString = function(e4, t4 = 0, i3 = e4.length) {
          let s3 = "";
          for (let r2 = t4; r2 < i3; ++r2) {
            let t5 = e4[r2];
            t5 > 65535 ? (t5 -= 65536, s3 += String.fromCharCode(55296 + (t5 >> 10)) + String.fromCharCode(t5 % 1024 + 56320)) : s3 += String.fromCharCode(t5);
          }
          return s3;
        }, t3.StringToUtf32 = class {
          constructor() {
            this._interim = 0;
          }
          clear() {
            this._interim = 0;
          }
          decode(e4, t4) {
            const i3 = e4.length;
            if (!i3) return 0;
            let s3 = 0, r2 = 0;
            if (this._interim) {
              const i4 = e4.charCodeAt(r2++);
              56320 <= i4 && i4 <= 57343 ? t4[s3++] = 1024 * (this._interim - 55296) + i4 - 56320 + 65536 : (t4[s3++] = this._interim, t4[s3++] = i4), this._interim = 0;
            }
            for (let o2 = r2; o2 < i3; ++o2) {
              const r3 = e4.charCodeAt(o2);
              if (55296 <= r3 && r3 <= 56319) {
                if (++o2 >= i3) return this._interim = r3, s3;
                const n2 = e4.charCodeAt(o2);
                56320 <= n2 && n2 <= 57343 ? t4[s3++] = 1024 * (r3 - 55296) + n2 - 56320 + 65536 : (t4[s3++] = r3, t4[s3++] = n2);
              } else 65279 !== r3 && (t4[s3++] = r3);
            }
            return s3;
          }
        }, t3.Utf8ToUtf32 = class {
          constructor() {
            this.interim = new Uint8Array(3);
          }
          clear() {
            this.interim.fill(0);
          }
          decode(e4, t4) {
            const i3 = e4.length;
            if (!i3) return 0;
            let s3, r2, o2, n2, a2 = 0, h2 = 0, l2 = 0;
            if (this.interim[0]) {
              let s4 = false, r3 = this.interim[0];
              r3 &= 192 == (224 & r3) ? 31 : 224 == (240 & r3) ? 15 : 7;
              let o3, n3 = 0;
              for (; (o3 = 63 & this.interim[++n3]) && n3 < 4; ) r3 <<= 6, r3 |= o3;
              const h3 = 192 == (224 & this.interim[0]) ? 2 : 224 == (240 & this.interim[0]) ? 3 : 4, c3 = h3 - n3;
              for (; l2 < c3; ) {
                if (l2 >= i3) return 0;
                if (o3 = e4[l2++], 128 != (192 & o3)) {
                  l2--, s4 = true;
                  break;
                }
                this.interim[n3++] = o3, r3 <<= 6, r3 |= 63 & o3;
              }
              s4 || (2 === h3 ? r3 < 128 ? l2-- : t4[a2++] = r3 : 3 === h3 ? r3 < 2048 || r3 >= 55296 && r3 <= 57343 || 65279 === r3 || (t4[a2++] = r3) : r3 < 65536 || r3 > 1114111 || (t4[a2++] = r3)), this.interim.fill(0);
            }
            const c2 = i3 - 4;
            let d2 = l2;
            for (; d2 < i3; ) {
              for (; !(!(d2 < c2) || 128 & (s3 = e4[d2]) || 128 & (r2 = e4[d2 + 1]) || 128 & (o2 = e4[d2 + 2]) || 128 & (n2 = e4[d2 + 3])); ) t4[a2++] = s3, t4[a2++] = r2, t4[a2++] = o2, t4[a2++] = n2, d2 += 4;
              if (s3 = e4[d2++], s3 < 128) t4[a2++] = s3;
              else if (192 == (224 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (h2 = (31 & s3) << 6 | 63 & r2, h2 < 128) {
                  d2--;
                  continue;
                }
                t4[a2++] = h2;
              } else if (224 == (240 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, a2;
                if (o2 = e4[d2++], 128 != (192 & o2)) {
                  d2--;
                  continue;
                }
                if (h2 = (15 & s3) << 12 | (63 & r2) << 6 | 63 & o2, h2 < 2048 || h2 >= 55296 && h2 <= 57343 || 65279 === h2) continue;
                t4[a2++] = h2;
              } else if (240 == (248 & s3)) {
                if (d2 >= i3) return this.interim[0] = s3, a2;
                if (r2 = e4[d2++], 128 != (192 & r2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, a2;
                if (o2 = e4[d2++], 128 != (192 & o2)) {
                  d2--;
                  continue;
                }
                if (d2 >= i3) return this.interim[0] = s3, this.interim[1] = r2, this.interim[2] = o2, a2;
                if (n2 = e4[d2++], 128 != (192 & n2)) {
                  d2--;
                  continue;
                }
                if (h2 = (7 & s3) << 18 | (63 & r2) << 12 | (63 & o2) << 6 | 63 & n2, h2 < 65536 || h2 > 1114111) continue;
                t4[a2++] = h2;
              }
            }
            return a2;
          }
        };
      }, 776: function(e3, t3, i3) {
        var s3 = this && this.__decorate || function(e4, t4, i4, s4) {
          var r3, o3 = arguments.length, n3 = o3 < 3 ? t4 : null === s4 ? s4 = Object.getOwnPropertyDescriptor(t4, i4) : s4;
          if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) n3 = Reflect.decorate(e4, t4, i4, s4);
          else for (var a3 = e4.length - 1; a3 >= 0; a3--) (r3 = e4[a3]) && (n3 = (o3 < 3 ? r3(n3) : o3 > 3 ? r3(t4, i4, n3) : r3(t4, i4)) || n3);
          return o3 > 3 && n3 && Object.defineProperty(t4, i4, n3), n3;
        }, r2 = this && this.__param || function(e4, t4) {
          return function(i4, s4) {
            t4(i4, s4, e4);
          };
        };
        Object.defineProperty(t3, "__esModule", { value: true }), t3.traceCall = t3.setTraceLogger = t3.LogService = void 0;
        const o2 = i3(859), n2 = i3(97), a2 = { trace: n2.LogLevelEnum.TRACE, debug: n2.LogLevelEnum.DEBUG, info: n2.LogLevelEnum.INFO, warn: n2.LogLevelEnum.WARN, error: n2.LogLevelEnum.ERROR, off: n2.LogLevelEnum.OFF };
        let h2, l2 = t3.LogService = class extends o2.Disposable {
          get logLevel() {
            return this._logLevel;
          }
          constructor(e4) {
            super(), this._optionsService = e4, this._logLevel = n2.LogLevelEnum.OFF, this._updateLogLevel(), this.register(this._optionsService.onSpecificOptionChange("logLevel", (() => this._updateLogLevel()))), h2 = this;
          }
          _updateLogLevel() {
            this._logLevel = a2[this._optionsService.rawOptions.logLevel];
          }
          _evalLazyOptionalParams(e4) {
            for (let t4 = 0; t4 < e4.length; t4++) "function" == typeof e4[t4] && (e4[t4] = e4[t4]());
          }
          _log(e4, t4, i4) {
            this._evalLazyOptionalParams(i4), e4.call(console, (this._optionsService.options.logger ? "" : "xterm.js: ") + t4, ...i4);
          }
          trace(e4, ...t4) {
            this._logLevel <= n2.LogLevelEnum.TRACE && this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, e4, t4);
          }
          debug(e4, ...t4) {
            this._logLevel <= n2.LogLevelEnum.DEBUG && this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, e4, t4);
          }
          info(e4, ...t4) {
            this._logLevel <= n2.LogLevelEnum.INFO && this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, e4, t4);
          }
          warn(e4, ...t4) {
            this._logLevel <= n2.LogLevelEnum.WARN && this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, e4, t4);
          }
          error(e4, ...t4) {
            this._logLevel <= n2.LogLevelEnum.ERROR && this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, e4, t4);
          }
        };
        t3.LogService = l2 = s3([r2(0, n2.IOptionsService)], l2), t3.setTraceLogger = function(e4) {
          h2 = e4;
        }, t3.traceCall = function(e4, t4, i4) {
          if ("function" != typeof i4.value) throw new Error("not supported");
          const s4 = i4.value;
          i4.value = function(...e5) {
            if (h2.logLevel !== n2.LogLevelEnum.TRACE) return s4.apply(this, e5);
            h2.trace(`GlyphRenderer#${s4.name}(${e5.map(((e6) => JSON.stringify(e6))).join(", ")})`);
            const t5 = s4.apply(this, e5);
            return h2.trace(`GlyphRenderer#${s4.name} return`, t5), t5;
          };
        };
      }, 726: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.createDecorator = t3.getServiceDependencies = t3.serviceRegistry = void 0;
        const i3 = "di$target", s3 = "di$dependencies";
        t3.serviceRegistry = /* @__PURE__ */ new Map(), t3.getServiceDependencies = function(e4) {
          return e4[s3] || [];
        }, t3.createDecorator = function(e4) {
          if (t3.serviceRegistry.has(e4)) return t3.serviceRegistry.get(e4);
          const r2 = function(e5, t4, o2) {
            if (3 !== arguments.length) throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
            !(function(e6, t5, r3) {
              t5[i3] === t5 ? t5[s3].push({ id: e6, index: r3 }) : (t5[s3] = [{ id: e6, index: r3 }], t5[i3] = t5);
            })(r2, e5, o2);
          };
          return r2.toString = () => e4, t3.serviceRegistry.set(e4, r2), r2;
        };
      }, 97: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.IDecorationService = t3.IUnicodeService = t3.IOscLinkService = t3.IOptionsService = t3.ILogService = t3.LogLevelEnum = t3.IInstantiationService = t3.ICharsetService = t3.ICoreService = t3.ICoreMouseService = t3.IBufferService = void 0;
        const s3 = i3(726);
        var r2;
        t3.IBufferService = (0, s3.createDecorator)("BufferService"), t3.ICoreMouseService = (0, s3.createDecorator)("CoreMouseService"), t3.ICoreService = (0, s3.createDecorator)("CoreService"), t3.ICharsetService = (0, s3.createDecorator)("CharsetService"), t3.IInstantiationService = (0, s3.createDecorator)("InstantiationService"), (function(e4) {
          e4[e4.TRACE = 0] = "TRACE", e4[e4.DEBUG = 1] = "DEBUG", e4[e4.INFO = 2] = "INFO", e4[e4.WARN = 3] = "WARN", e4[e4.ERROR = 4] = "ERROR", e4[e4.OFF = 5] = "OFF";
        })(r2 || (t3.LogLevelEnum = r2 = {})), t3.ILogService = (0, s3.createDecorator)("LogService"), t3.IOptionsService = (0, s3.createDecorator)("OptionsService"), t3.IOscLinkService = (0, s3.createDecorator)("OscLinkService"), t3.IUnicodeService = (0, s3.createDecorator)("UnicodeService"), t3.IDecorationService = (0, s3.createDecorator)("DecorationService");
      } }, t2 = {};
      function i2(s3) {
        var r2 = t2[s3];
        if (void 0 !== r2) return r2.exports;
        var o2 = t2[s3] = { exports: {} };
        return e2[s3].call(o2.exports, o2, o2.exports, i2), o2.exports;
      }
      var s2 = {};
      return (() => {
        var e3 = s2;
        Object.defineProperty(e3, "__esModule", { value: true }), e3.WebglAddon = void 0;
        const t3 = i2(345), r2 = i2(859), o2 = i2(399), n2 = i2(666), a2 = i2(776);
        class h2 extends r2.Disposable {
          constructor(e4) {
            if (o2.isSafari && (0, o2.getSafariVersion)() < 16) {
              const e5 = { antialias: false, depth: false, preserveDrawingBuffer: true };
              if (!document.createElement("canvas").getContext("webgl2", e5)) throw new Error("Webgl2 is only supported on Safari 16 and above");
            }
            super(), this._preserveDrawingBuffer = e4, this._onChangeTextureAtlas = this.register(new t3.EventEmitter()), this.onChangeTextureAtlas = this._onChangeTextureAtlas.event, this._onAddTextureAtlasCanvas = this.register(new t3.EventEmitter()), this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event, this._onRemoveTextureAtlasCanvas = this.register(new t3.EventEmitter()), this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event, this._onContextLoss = this.register(new t3.EventEmitter()), this.onContextLoss = this._onContextLoss.event;
          }
          activate(e4) {
            const i3 = e4._core;
            if (!e4.element) return void this.register(i3.onWillOpen((() => this.activate(e4))));
            this._terminal = e4;
            const s3 = i3.coreService, o3 = i3.optionsService, h3 = i3, l2 = h3._renderService, c2 = h3._characterJoinerService, d2 = h3._charSizeService, _2 = h3._coreBrowserService, u2 = h3._decorationService, g2 = h3._logService, v2 = h3._themeService;
            (0, a2.setTraceLogger)(g2), this._renderer = this.register(new n2.WebglRenderer(e4, c2, d2, _2, s3, u2, o3, v2, this._preserveDrawingBuffer)), this.register((0, t3.forwardEvent)(this._renderer.onContextLoss, this._onContextLoss)), this.register((0, t3.forwardEvent)(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas)), this.register((0, t3.forwardEvent)(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas)), this.register((0, t3.forwardEvent)(this._renderer.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas)), l2.setRenderer(this._renderer), this.register((0, r2.toDisposable)((() => {
              const t4 = this._terminal._core._renderService;
              t4.setRenderer(this._terminal._core._createRenderer()), t4.handleResize(e4.cols, e4.rows);
            })));
          }
          get textureAtlas() {
            return this._renderer?.textureAtlas;
          }
          clearTextureAtlas() {
            this._renderer?.clearTextureAtlas();
          }
        }
        e3.WebglAddon = h2;
      })(), s2;
    })()));
  })(addonWebgl);
  return addonWebgl.exports;
}
var addonWebglExports = requireAddonWebgl();
var addonFit = { exports: {} };
var hasRequiredAddonFit;
function requireAddonFit() {
  if (hasRequiredAddonFit) return addonFit.exports;
  hasRequiredAddonFit = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(self, (() => (() => {
      var e2 = {};
      return (() => {
        var t2 = e2;
        Object.defineProperty(t2, "__esModule", { value: true }), t2.FitAddon = void 0, t2.FitAddon = class {
          activate(e3) {
            this._terminal = e3;
          }
          dispose() {
          }
          fit() {
            const e3 = this.proposeDimensions();
            if (!e3 || !this._terminal || isNaN(e3.cols) || isNaN(e3.rows)) return;
            const t3 = this._terminal._core;
            this._terminal.rows === e3.rows && this._terminal.cols === e3.cols || (t3._renderService.clear(), this._terminal.resize(e3.cols, e3.rows));
          }
          proposeDimensions() {
            if (!this._terminal) return;
            if (!this._terminal.element || !this._terminal.element.parentElement) return;
            const e3 = this._terminal._core, t3 = e3._renderService.dimensions;
            if (0 === t3.css.cell.width || 0 === t3.css.cell.height) return;
            const r2 = 0 === this._terminal.options.scrollback ? 0 : e3.viewport.scrollBarWidth, i2 = window.getComputedStyle(this._terminal.element.parentElement), o2 = parseInt(i2.getPropertyValue("height")), s2 = Math.max(0, parseInt(i2.getPropertyValue("width"))), n2 = window.getComputedStyle(this._terminal.element), l2 = o2 - (parseInt(n2.getPropertyValue("padding-top")) + parseInt(n2.getPropertyValue("padding-bottom"))), a2 = s2 - (parseInt(n2.getPropertyValue("padding-right")) + parseInt(n2.getPropertyValue("padding-left"))) - r2;
            return { cols: Math.max(2, Math.floor(a2 / t3.css.cell.width)), rows: Math.max(1, Math.floor(l2 / t3.css.cell.height)) };
          }
        };
      })(), e2;
    })()));
  })(addonFit);
  return addonFit.exports;
}
var addonFitExports = requireAddonFit();
var addonWebLinks = { exports: {} };
var hasRequiredAddonWebLinks;
function requireAddonWebLinks() {
  if (hasRequiredAddonWebLinks) return addonWebLinks.exports;
  hasRequiredAddonWebLinks = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(self, (() => (() => {
      var e2 = { 6: (e3, t3) => {
        function n3(e4) {
          try {
            const t4 = new URL(e4), n4 = t4.password && t4.username ? `${t4.protocol}//${t4.username}:${t4.password}@${t4.host}` : t4.username ? `${t4.protocol}//${t4.username}@${t4.host}` : `${t4.protocol}//${t4.host}`;
            return e4.toLocaleLowerCase().startsWith(n4.toLocaleLowerCase());
          } catch (e5) {
            return false;
          }
        }
        Object.defineProperty(t3, "__esModule", { value: true }), t3.LinkComputer = t3.WebLinkProvider = void 0, t3.WebLinkProvider = class {
          constructor(e4, t4, n4, o4 = {}) {
            this._terminal = e4, this._regex = t4, this._handler = n4, this._options = o4;
          }
          provideLinks(e4, t4) {
            const n4 = o3.computeLink(e4, this._regex, this._terminal, this._handler);
            t4(this._addCallbacks(n4));
          }
          _addCallbacks(e4) {
            return e4.map(((e5) => (e5.leave = this._options.leave, e5.hover = (t4, n4) => {
              if (this._options.hover) {
                const { range: o4 } = e5;
                this._options.hover(t4, n4, o4);
              }
            }, e5)));
          }
        };
        class o3 {
          static computeLink(e4, t4, r2, i2) {
            const s2 = new RegExp(t4.source, (t4.flags || "") + "g"), [a2, c2] = o3._getWindowedLineStrings(e4 - 1, r2), l2 = a2.join("");
            let d2;
            const p2 = [];
            for (; d2 = s2.exec(l2); ) {
              const e5 = d2[0];
              if (!n3(e5)) continue;
              const [t5, s3] = o3._mapStrIdx(r2, c2, 0, d2.index), [a3, l3] = o3._mapStrIdx(r2, t5, s3, e5.length);
              if (-1 === t5 || -1 === s3 || -1 === a3 || -1 === l3) continue;
              const h2 = { start: { x: s3 + 1, y: t5 + 1 }, end: { x: l3, y: a3 + 1 } };
              p2.push({ range: h2, text: e5, activate: i2 });
            }
            return p2;
          }
          static _getWindowedLineStrings(e4, t4) {
            let n4, o4 = e4, r2 = e4, i2 = 0, s2 = "";
            const a2 = [];
            if (n4 = t4.buffer.active.getLine(e4)) {
              const e5 = n4.translateToString(true);
              if (n4.isWrapped && " " !== e5[0]) {
                for (i2 = 0; (n4 = t4.buffer.active.getLine(--o4)) && i2 < 2048 && (s2 = n4.translateToString(true), i2 += s2.length, a2.push(s2), n4.isWrapped && -1 === s2.indexOf(" ")); ) ;
                a2.reverse();
              }
              for (a2.push(e5), i2 = 0; (n4 = t4.buffer.active.getLine(++r2)) && n4.isWrapped && i2 < 2048 && (s2 = n4.translateToString(true), i2 += s2.length, a2.push(s2), -1 === s2.indexOf(" ")); ) ;
            }
            return [a2, o4];
          }
          static _mapStrIdx(e4, t4, n4, o4) {
            const r2 = e4.buffer.active, i2 = r2.getNullCell();
            let s2 = n4;
            for (; o4; ) {
              const e5 = r2.getLine(t4);
              if (!e5) return [-1, -1];
              for (let n5 = s2; n5 < e5.length; ++n5) {
                e5.getCell(n5, i2);
                const s3 = i2.getChars();
                if (i2.getWidth() && (o4 -= s3.length || 1, n5 === e5.length - 1 && "" === s3)) {
                  const e6 = r2.getLine(t4 + 1);
                  e6 && e6.isWrapped && (e6.getCell(0, i2), 2 === i2.getWidth() && (o4 += 1));
                }
                if (o4 < 0) return [t4, n5];
              }
              t4++, s2 = 0;
            }
            return [t4, s2];
          }
        }
        t3.LinkComputer = o3;
      } }, t2 = {};
      function n2(o3) {
        var r2 = t2[o3];
        if (void 0 !== r2) return r2.exports;
        var i2 = t2[o3] = { exports: {} };
        return e2[o3](i2, i2.exports, n2), i2.exports;
      }
      var o2 = {};
      return (() => {
        var e3 = o2;
        Object.defineProperty(e3, "__esModule", { value: true }), e3.WebLinksAddon = void 0;
        const t3 = n2(6), r2 = /(https?|HTTPS?):[/]{2}[^\s"'!*(){}|\\\^<>`]*[^\s"':,.!?{}|\\\^~\[\]`()<>]/;
        function i2(e4, t4) {
          const n3 = window.open();
          if (n3) {
            try {
              n3.opener = null;
            } catch {
            }
            n3.location.href = t4;
          } else console.warn("Opening link blocked as opener could not be cleared");
        }
        e3.WebLinksAddon = class {
          constructor(e4 = i2, t4 = {}) {
            this._handler = e4, this._options = t4;
          }
          activate(e4) {
            this._terminal = e4;
            const n3 = this._options, o3 = n3.urlRegex || r2;
            this._linkProvider = this._terminal.registerLinkProvider(new t3.WebLinkProvider(this._terminal, o3, this._handler, n3));
          }
          dispose() {
            this._linkProvider?.dispose();
          }
        };
      })(), o2;
    })()));
  })(addonWebLinks);
  return addonWebLinks.exports;
}
var addonWebLinksExports = requireAddonWebLinks();
var addonUnicode11$1 = { exports: {} };
var addonUnicode11 = addonUnicode11$1.exports;
var hasRequiredAddonUnicode11;
function requireAddonUnicode11() {
  if (hasRequiredAddonUnicode11) return addonUnicode11$1.exports;
  hasRequiredAddonUnicode11 = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(addonUnicode11, (() => (() => {
      var e2 = { 433: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeV11 = void 0;
        const r3 = i3(938), s2 = [[768, 879], [1155, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1541], [1552, 1562], [1564, 1564], [1611, 1631], [1648, 1648], [1750, 1757], [1759, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2045, 2045], [2070, 2073], [2075, 2083], [2085, 2087], [2089, 2093], [2137, 2139], [2259, 2306], [2362, 2362], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2391], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2558, 2558], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2641, 2641], [2672, 2673], [2677, 2677], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2810, 2815], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2884], [2893, 2893], [2902, 2902], [2914, 2915], [2946, 2946], [3008, 3008], [3021, 3021], [3072, 3072], [3076, 3076], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3170, 3171], [3201, 3201], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3328, 3329], [3387, 3388], [3393, 3396], [3405, 3405], [3426, 3427], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3981, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4151], [4153, 4154], [4157, 4158], [4184, 4185], [4190, 4192], [4209, 4212], [4226, 4226], [4229, 4230], [4237, 4237], [4253, 4253], [4448, 4607], [4957, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6158], [6277, 6278], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6683, 6683], [6742, 6742], [6744, 6750], [6752, 6752], [6754, 6754], [6757, 6764], [6771, 6780], [6783, 6783], [6832, 6846], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7040, 7041], [7074, 7077], [7080, 7081], [7083, 7085], [7142, 7142], [7144, 7145], [7149, 7149], [7151, 7153], [7212, 7219], [7222, 7223], [7376, 7378], [7380, 7392], [7394, 7400], [7405, 7405], [7412, 7412], [7416, 7417], [7616, 7673], [7675, 7679], [8203, 8207], [8234, 8238], [8288, 8292], [8294, 8303], [8400, 8432], [11503, 11505], [11647, 11647], [11744, 11775], [12330, 12333], [12441, 12442], [42607, 42610], [42612, 42621], [42654, 42655], [42736, 42737], [43010, 43010], [43014, 43014], [43019, 43019], [43045, 43046], [43204, 43205], [43232, 43249], [43263, 43263], [43302, 43309], [43335, 43345], [43392, 43394], [43443, 43443], [43446, 43449], [43452, 43453], [43493, 43493], [43561, 43566], [43569, 43570], [43573, 43574], [43587, 43587], [43596, 43596], [43644, 43644], [43696, 43696], [43698, 43700], [43703, 43704], [43710, 43711], [43713, 43713], [43756, 43757], [43766, 43766], [44005, 44005], [44008, 44008], [44013, 44013], [64286, 64286], [65024, 65039], [65056, 65071], [65279, 65279], [65529, 65531]], n2 = [[66045, 66045], [66272, 66272], [66422, 66426], [68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [68325, 68326], [68900, 68903], [69446, 69456], [69633, 69633], [69688, 69702], [69759, 69761], [69811, 69814], [69817, 69818], [69821, 69821], [69837, 69837], [69888, 69890], [69927, 69931], [69933, 69940], [70003, 70003], [70016, 70017], [70070, 70078], [70089, 70092], [70191, 70193], [70196, 70196], [70198, 70199], [70206, 70206], [70367, 70367], [70371, 70378], [70400, 70401], [70459, 70460], [70464, 70464], [70502, 70508], [70512, 70516], [70712, 70719], [70722, 70724], [70726, 70726], [70750, 70750], [70835, 70840], [70842, 70842], [70847, 70848], [70850, 70851], [71090, 71093], [71100, 71101], [71103, 71104], [71132, 71133], [71219, 71226], [71229, 71229], [71231, 71232], [71339, 71339], [71341, 71341], [71344, 71349], [71351, 71351], [71453, 71455], [71458, 71461], [71463, 71467], [71727, 71735], [71737, 71738], [72148, 72151], [72154, 72155], [72160, 72160], [72193, 72202], [72243, 72248], [72251, 72254], [72263, 72263], [72273, 72278], [72281, 72283], [72330, 72342], [72344, 72345], [72752, 72758], [72760, 72765], [72767, 72767], [72850, 72871], [72874, 72880], [72882, 72883], [72885, 72886], [73009, 73014], [73018, 73018], [73020, 73021], [73023, 73029], [73031, 73031], [73104, 73105], [73109, 73109], [73111, 73111], [73459, 73460], [78896, 78904], [92912, 92916], [92976, 92982], [94031, 94031], [94095, 94098], [113821, 113822], [113824, 113827], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [121344, 121398], [121403, 121452], [121461, 121461], [121476, 121476], [121499, 121503], [121505, 121519], [122880, 122886], [122888, 122904], [122907, 122913], [122915, 122916], [122918, 122922], [123184, 123190], [123628, 123631], [125136, 125142], [125252, 125258], [917505, 917505], [917536, 917631], [917760, 917999]], o2 = [[4352, 4447], [8986, 8987], [9001, 9002], [9193, 9196], [9200, 9200], [9203, 9203], [9725, 9726], [9748, 9749], [9800, 9811], [9855, 9855], [9875, 9875], [9889, 9889], [9898, 9899], [9917, 9918], [9924, 9925], [9934, 9934], [9940, 9940], [9962, 9962], [9970, 9971], [9973, 9973], [9978, 9978], [9981, 9981], [9989, 9989], [9994, 9995], [10024, 10024], [10060, 10060], [10062, 10062], [10067, 10069], [10071, 10071], [10133, 10135], [10160, 10160], [10175, 10175], [11035, 11036], [11088, 11088], [11093, 11093], [11904, 11929], [11931, 12019], [12032, 12245], [12272, 12283], [12288, 12329], [12334, 12350], [12353, 12438], [12443, 12543], [12549, 12591], [12593, 12686], [12688, 12730], [12736, 12771], [12784, 12830], [12832, 12871], [12880, 19903], [19968, 42124], [42128, 42182], [43360, 43388], [44032, 55203], [63744, 64255], [65040, 65049], [65072, 65106], [65108, 65126], [65128, 65131], [65281, 65376], [65504, 65510]], c2 = [[94176, 94179], [94208, 100343], [100352, 101106], [110592, 110878], [110928, 110930], [110948, 110951], [110960, 111355], [126980, 126980], [127183, 127183], [127374, 127374], [127377, 127386], [127488, 127490], [127504, 127547], [127552, 127560], [127568, 127569], [127584, 127589], [127744, 127776], [127789, 127797], [127799, 127868], [127870, 127891], [127904, 127946], [127951, 127955], [127968, 127984], [127988, 127988], [127992, 128062], [128064, 128064], [128066, 128252], [128255, 128317], [128331, 128334], [128336, 128359], [128378, 128378], [128405, 128406], [128420, 128420], [128507, 128591], [128640, 128709], [128716, 128716], [128720, 128722], [128725, 128725], [128747, 128748], [128756, 128762], [128992, 129003], [129293, 129393], [129395, 129398], [129402, 129442], [129445, 129450], [129454, 129482], [129485, 129535], [129648, 129651], [129656, 129658], [129664, 129666], [129680, 129685], [131072, 196605], [196608, 262141]];
        let l2;
        function d2(e4, t4) {
          let i4, r4 = 0, s3 = t4.length - 1;
          if (e4 < t4[0][0] || e4 > t4[s3][1]) return false;
          for (; s3 >= r4; ) if (i4 = r4 + s3 >> 1, e4 > t4[i4][1]) r4 = i4 + 1;
          else {
            if (!(e4 < t4[i4][0])) return true;
            s3 = i4 - 1;
          }
          return false;
        }
        t3.UnicodeV11 = class {
          constructor() {
            if (this.version = "11", !l2) {
              l2 = new Uint8Array(65536), l2.fill(1), l2[0] = 0, l2.fill(0, 1, 32), l2.fill(0, 127, 160);
              for (let e4 = 0; e4 < s2.length; ++e4) l2.fill(0, s2[e4][0], s2[e4][1] + 1);
              for (let e4 = 0; e4 < o2.length; ++e4) l2.fill(2, o2[e4][0], o2[e4][1] + 1);
            }
          }
          wcwidth(e4) {
            return e4 < 32 ? 0 : e4 < 127 ? 1 : e4 < 65536 ? l2[e4] : d2(e4, n2) ? 0 : d2(e4, c2) ? 2 : 1;
          }
          charProperties(e4, t4) {
            let i4 = this.wcwidth(e4), s3 = 0 === i4 && 0 !== t4;
            if (s3) {
              const e5 = r3.UnicodeService.extractWidth(t4);
              0 === e5 ? s3 = false : e5 > i4 && (i4 = e5);
            }
            return r3.UnicodeService.createPropertyValue(0, i4, s3);
          }
        };
      }, 345: (e3, t3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.runAndSubscribe = t3.forwardEvent = t3.EventEmitter = void 0, t3.EventEmitter = class {
          constructor() {
            this._listeners = [], this._disposed = false;
          }
          get event() {
            return this._event || (this._event = (e4) => (this._listeners.push(e4), { dispose: () => {
              if (!this._disposed) {
                for (let t4 = 0; t4 < this._listeners.length; t4++) if (this._listeners[t4] === e4) return void this._listeners.splice(t4, 1);
              }
            } })), this._event;
          }
          fire(e4, t4) {
            const i3 = [];
            for (let e5 = 0; e5 < this._listeners.length; e5++) i3.push(this._listeners[e5]);
            for (let r3 = 0; r3 < i3.length; r3++) i3[r3].call(void 0, e4, t4);
          }
          dispose() {
            this.clearListeners(), this._disposed = true;
          }
          clearListeners() {
            this._listeners && (this._listeners.length = 0);
          }
        }, t3.forwardEvent = function(e4, t4) {
          return e4(((e5) => t4.fire(e5)));
        }, t3.runAndSubscribe = function(e4, t4) {
          return t4(void 0), e4(((e5) => t4(e5)));
        };
      }, 490: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeV6 = void 0;
        const r3 = i3(938), s2 = [[768, 879], [1155, 1158], [1160, 1161], [1425, 1469], [1471, 1471], [1473, 1474], [1476, 1477], [1479, 1479], [1536, 1539], [1552, 1557], [1611, 1630], [1648, 1648], [1750, 1764], [1767, 1768], [1770, 1773], [1807, 1807], [1809, 1809], [1840, 1866], [1958, 1968], [2027, 2035], [2305, 2306], [2364, 2364], [2369, 2376], [2381, 2381], [2385, 2388], [2402, 2403], [2433, 2433], [2492, 2492], [2497, 2500], [2509, 2509], [2530, 2531], [2561, 2562], [2620, 2620], [2625, 2626], [2631, 2632], [2635, 2637], [2672, 2673], [2689, 2690], [2748, 2748], [2753, 2757], [2759, 2760], [2765, 2765], [2786, 2787], [2817, 2817], [2876, 2876], [2879, 2879], [2881, 2883], [2893, 2893], [2902, 2902], [2946, 2946], [3008, 3008], [3021, 3021], [3134, 3136], [3142, 3144], [3146, 3149], [3157, 3158], [3260, 3260], [3263, 3263], [3270, 3270], [3276, 3277], [3298, 3299], [3393, 3395], [3405, 3405], [3530, 3530], [3538, 3540], [3542, 3542], [3633, 3633], [3636, 3642], [3655, 3662], [3761, 3761], [3764, 3769], [3771, 3772], [3784, 3789], [3864, 3865], [3893, 3893], [3895, 3895], [3897, 3897], [3953, 3966], [3968, 3972], [3974, 3975], [3984, 3991], [3993, 4028], [4038, 4038], [4141, 4144], [4146, 4146], [4150, 4151], [4153, 4153], [4184, 4185], [4448, 4607], [4959, 4959], [5906, 5908], [5938, 5940], [5970, 5971], [6002, 6003], [6068, 6069], [6071, 6077], [6086, 6086], [6089, 6099], [6109, 6109], [6155, 6157], [6313, 6313], [6432, 6434], [6439, 6440], [6450, 6450], [6457, 6459], [6679, 6680], [6912, 6915], [6964, 6964], [6966, 6970], [6972, 6972], [6978, 6978], [7019, 7027], [7616, 7626], [7678, 7679], [8203, 8207], [8234, 8238], [8288, 8291], [8298, 8303], [8400, 8431], [12330, 12335], [12441, 12442], [43014, 43014], [43019, 43019], [43045, 43046], [64286, 64286], [65024, 65039], [65056, 65059], [65279, 65279], [65529, 65531]], n2 = [[68097, 68099], [68101, 68102], [68108, 68111], [68152, 68154], [68159, 68159], [119143, 119145], [119155, 119170], [119173, 119179], [119210, 119213], [119362, 119364], [917505, 917505], [917536, 917631], [917760, 917999]];
        let o2;
        t3.UnicodeV6 = class {
          constructor() {
            if (this.version = "6", !o2) {
              o2 = new Uint8Array(65536), o2.fill(1), o2[0] = 0, o2.fill(0, 1, 32), o2.fill(0, 127, 160), o2.fill(2, 4352, 4448), o2[9001] = 2, o2[9002] = 2, o2.fill(2, 11904, 42192), o2[12351] = 1, o2.fill(2, 44032, 55204), o2.fill(2, 63744, 64256), o2.fill(2, 65040, 65050), o2.fill(2, 65072, 65136), o2.fill(2, 65280, 65377), o2.fill(2, 65504, 65511);
              for (let e4 = 0; e4 < s2.length; ++e4) o2.fill(0, s2[e4][0], s2[e4][1] + 1);
            }
          }
          wcwidth(e4) {
            return e4 < 32 ? 0 : e4 < 127 ? 1 : e4 < 65536 ? o2[e4] : (function(e5, t4) {
              let i4, r4 = 0, s3 = t4.length - 1;
              if (e5 < t4[0][0] || e5 > t4[s3][1]) return false;
              for (; s3 >= r4; ) if (i4 = r4 + s3 >> 1, e5 > t4[i4][1]) r4 = i4 + 1;
              else {
                if (!(e5 < t4[i4][0])) return true;
                s3 = i4 - 1;
              }
              return false;
            })(e4, n2) ? 0 : e4 >= 131072 && e4 <= 196605 || e4 >= 196608 && e4 <= 262141 ? 2 : 1;
          }
          charProperties(e4, t4) {
            let i4 = this.wcwidth(e4), s3 = 0 === i4 && 0 !== t4;
            if (s3) {
              const e5 = r3.UnicodeService.extractWidth(t4);
              0 === e5 ? s3 = false : e5 > i4 && (i4 = e5);
            }
            return r3.UnicodeService.createPropertyValue(0, i4, s3);
          }
        };
      }, 938: (e3, t3, i3) => {
        Object.defineProperty(t3, "__esModule", { value: true }), t3.UnicodeService = void 0;
        const r3 = i3(345), s2 = i3(490);
        class n2 {
          static extractShouldJoin(e4) {
            return 0 != (1 & e4);
          }
          static extractWidth(e4) {
            return e4 >> 1 & 3;
          }
          static extractCharKind(e4) {
            return e4 >> 3;
          }
          static createPropertyValue(e4, t4, i4 = false) {
            return (16777215 & e4) << 3 | (3 & t4) << 1 | (i4 ? 1 : 0);
          }
          constructor() {
            this._providers = /* @__PURE__ */ Object.create(null), this._active = "", this._onChange = new r3.EventEmitter(), this.onChange = this._onChange.event;
            const e4 = new s2.UnicodeV6();
            this.register(e4), this._active = e4.version, this._activeProvider = e4;
          }
          dispose() {
            this._onChange.dispose();
          }
          get versions() {
            return Object.keys(this._providers);
          }
          get activeVersion() {
            return this._active;
          }
          set activeVersion(e4) {
            if (!this._providers[e4]) throw new Error(`unknown Unicode version "${e4}"`);
            this._active = e4, this._activeProvider = this._providers[e4], this._onChange.fire(e4);
          }
          register(e4) {
            this._providers[e4.version] = e4;
          }
          wcwidth(e4) {
            return this._activeProvider.wcwidth(e4);
          }
          getStringCellWidth(e4) {
            let t4 = 0, i4 = 0;
            const r4 = e4.length;
            for (let s3 = 0; s3 < r4; ++s3) {
              let o2 = e4.charCodeAt(s3);
              if (55296 <= o2 && o2 <= 56319) {
                if (++s3 >= r4) return t4 + this.wcwidth(o2);
                const i5 = e4.charCodeAt(s3);
                56320 <= i5 && i5 <= 57343 ? o2 = 1024 * (o2 - 55296) + i5 - 56320 + 65536 : t4 += this.wcwidth(i5);
              }
              const c2 = this.charProperties(o2, i4);
              let l2 = n2.extractWidth(c2);
              n2.extractShouldJoin(c2) && (l2 -= n2.extractWidth(i4)), t4 += l2, i4 = c2;
            }
            return t4;
          }
          charProperties(e4, t4) {
            return this._activeProvider.charProperties(e4, t4);
          }
        }
        t3.UnicodeService = n2;
      } }, t2 = {};
      function i2(r3) {
        var s2 = t2[r3];
        if (void 0 !== s2) return s2.exports;
        var n2 = t2[r3] = { exports: {} };
        return e2[r3](n2, n2.exports, i2), n2.exports;
      }
      var r2 = {};
      return (() => {
        var e3 = r2;
        Object.defineProperty(e3, "__esModule", { value: true }), e3.Unicode11Addon = void 0;
        const t3 = i2(433);
        e3.Unicode11Addon = class {
          activate(e4) {
            e4.unicode.register(new t3.UnicodeV11());
          }
          dispose() {
          }
        };
      })(), r2;
    })()));
  })(addonUnicode11$1);
  return addonUnicode11$1.exports;
}
var addonUnicode11Exports = requireAddonUnicode11();
var decko = {};
var hasRequiredDecko;
function requireDecko() {
  if (hasRequiredDecko) return decko;
  hasRequiredDecko = 1;
  (function(exports) {
    (function(global2, factory) {
      {
        factory(exports);
      }
    })(decko, function(exports2) {
      exports2.__esModule = true;
      var EMPTY = {};
      var HOP = Object.prototype.hasOwnProperty;
      var fns = { memoize: function memoize2(fn) {
        var opt = arguments.length <= 1 || arguments[1] === void 0 ? EMPTY : arguments[1];
        var cache = opt.cache || {};
        return function() {
          for (var _len = arguments.length, a2 = Array(_len), _key = 0; _key < _len; _key++) {
            a2[_key] = arguments[_key];
          }
          var k2 = String(a2[0]);
          if (opt.caseSensitive === false) k2 = k2.toLowerCase();
          return HOP.call(cache, k2) ? cache[k2] : cache[k2] = fn.apply(this, a2);
        };
      }, debounce: function debounce2(fn, opts) {
        if (typeof opts === "function") {
          var p2 = fn;
          fn = opts;
          opts = p2;
        }
        var delay = opts && opts.delay || opts || 0, args = void 0, context = void 0, timer = void 0;
        return function() {
          for (var _len2 = arguments.length, a2 = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            a2[_key2] = arguments[_key2];
          }
          args = a2;
          context = this;
          if (!timer) timer = setTimeout(function() {
            fn.apply(context, args);
            args = context = timer = null;
          }, delay);
        };
      }, bind: function bind2(target, key, _ref) {
        var fn = _ref.value;
        return { configurable: true, get: function get() {
          var value = fn.bind(this);
          Object.defineProperty(this, key, { value, configurable: true, writable: true });
          return value;
        } };
      } };
      var memoize = multiMethod(fns.memoize), debounce = multiMethod(fns.debounce), bind = multiMethod(function(f2, c2) {
        return f2.bind(c2);
      }, function() {
        return fns.bind;
      });
      exports2.memoize = memoize;
      exports2.debounce = debounce;
      exports2.bind = bind;
      exports2["default"] = { memoize, debounce, bind };
      function multiMethod(inner, deco) {
        deco = deco || inner.decorate || decorator(inner);
        var d2 = deco();
        return function() {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }
          var l2 = args.length;
          return (l2 < 2 ? deco : l2 > 2 ? d2 : inner).apply(void 0, args);
        };
      }
      function decorator(fn) {
        return function(opt) {
          return typeof opt === "function" ? fn(opt) : function(target, key, desc) {
            desc.value = fn(desc.value, opt, target, key, desc);
          };
        };
      }
    });
  })(decko);
  return decko;
}
var deckoExports = requireDecko();
var _class$1;
function _applyDecoratedDescriptor$1(i2, e2, r2, n2, l2) {
  var a2 = {};
  return Object.keys(n2).forEach(function(i22) {
    a2[i22] = n2[i22];
  }), a2.enumerable = !!a2.enumerable, a2.configurable = !!a2.configurable, ("value" in a2 || a2.initializer) && (a2.writable = true), a2 = r2.slice().reverse().reduce(function(r22, n22) {
    return n22(i2, e2, r22) || r22;
  }, a2), l2 && void 0 !== a2.initializer && (a2.value = a2.initializer ? a2.initializer.call(l2) : void 0, a2.initializer = void 0), void 0 === a2.initializer ? (Object.defineProperty(i2, e2, a2), null) : a2;
}
let OverlayAddon = (_class$1 = class OverlayAddon2 {
  constructor() {
    this.overlayNode = document.createElement("div");
    this.overlayNode.style.cssText = `border-radius: 15px;
font-size: xx-large;
opacity: 0.75;
padding: 0.2em 0.5em 0.2em 0.5em;
position: absolute;
-webkit-user-select: none;
-webkit-transition: opacity 180ms ease-in;
-moz-user-select: none;
-moz-transition: opacity 180ms ease-in;`;
    this.overlayNode.addEventListener("mousedown", (e2) => {
      e2.preventDefault();
      e2.stopPropagation();
    }, true);
  }
  activate(terminal) {
    this.terminal = terminal;
  }
  dispose() {
  }
  showOverlay(msg, timeout) {
    const {
      terminal,
      overlayNode
    } = this;
    if (!terminal.element) return;
    overlayNode.style.color = "#101010";
    overlayNode.style.backgroundColor = "#f0f0f0";
    overlayNode.textContent = msg;
    overlayNode.style.opacity = "0.75";
    if (!overlayNode.parentNode) {
      terminal.element.appendChild(overlayNode);
    }
    const divSize = terminal.element.getBoundingClientRect();
    const overlaySize = overlayNode.getBoundingClientRect();
    overlayNode.style.top = (divSize.height - overlaySize.height) / 2 + "px";
    overlayNode.style.left = (divSize.width - overlaySize.width) / 2 + "px";
    if (this.overlayTimeout) clearTimeout(this.overlayTimeout);
    if (!timeout) return;
    this.overlayTimeout = window.setTimeout(() => {
      overlayNode.style.opacity = "0";
      this.overlayTimeout = window.setTimeout(() => {
        if (overlayNode.parentNode) {
          overlayNode.parentNode.removeChild(overlayNode);
        }
        this.overlayTimeout = void 0;
        overlayNode.style.opacity = "0.75";
      }, 200);
    }, timeout || 1500);
  }
}, _applyDecoratedDescriptor$1(_class$1.prototype, "showOverlay", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class$1.prototype, "showOverlay"), _class$1.prototype), _class$1);
var FileSaver_min$1 = { exports: {} };
var FileSaver_min = FileSaver_min$1.exports;
var hasRequiredFileSaver_min;
function requireFileSaver_min() {
  if (hasRequiredFileSaver_min) return FileSaver_min$1.exports;
  hasRequiredFileSaver_min = 1;
  (function(module, exports) {
    (function(a2, b2) {
      b2();
    })(FileSaver_min, function() {
      function b2(a3, b3) {
        return "undefined" == typeof b3 ? b3 = { autoBom: false } : "object" != typeof b3 && (console.warn("Deprecated: Expected third argument to be a object"), b3 = { autoBom: !b3 }), b3.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a3.type) ? new Blob(["\uFEFF", a3], { type: a3.type }) : a3;
      }
      function c2(a3, b3, c3) {
        var d3 = new XMLHttpRequest();
        d3.open("GET", a3), d3.responseType = "blob", d3.onload = function() {
          g2(d3.response, b3, c3);
        }, d3.onerror = function() {
          console.error("could not download file");
        }, d3.send();
      }
      function d2(a3) {
        var b3 = new XMLHttpRequest();
        b3.open("HEAD", a3, false);
        try {
          b3.send();
        } catch (a4) {
        }
        return 200 <= b3.status && 299 >= b3.status;
      }
      function e2(a3) {
        try {
          a3.dispatchEvent(new MouseEvent("click"));
        } catch (c3) {
          var b3 = document.createEvent("MouseEvents");
          b3.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null), a3.dispatchEvent(b3);
        }
      }
      var f2 = "object" == typeof window && window.window === window ? window : "object" == typeof self && self.self === self ? self : "object" == typeof commonjsGlobal && commonjsGlobal.global === commonjsGlobal ? commonjsGlobal : void 0, a2 = f2.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent), g2 = f2.saveAs || ("object" != typeof window || window !== f2 ? function() {
      } : "download" in HTMLAnchorElement.prototype && !a2 ? function(b3, g3, h2) {
        var i2 = f2.URL || f2.webkitURL, j2 = document.createElement("a");
        g3 = g3 || b3.name || "download", j2.download = g3, j2.rel = "noopener", "string" == typeof b3 ? (j2.href = b3, j2.origin === location.origin ? e2(j2) : d2(j2.href) ? c2(b3, g3, h2) : e2(j2, j2.target = "_blank")) : (j2.href = i2.createObjectURL(b3), setTimeout(function() {
          i2.revokeObjectURL(j2.href);
        }, 4e4), setTimeout(function() {
          e2(j2);
        }, 0));
      } : "msSaveOrOpenBlob" in navigator ? function(f3, g3, h2) {
        if (g3 = g3 || f3.name || "download", "string" != typeof f3) navigator.msSaveOrOpenBlob(b2(f3, h2), g3);
        else if (d2(f3)) c2(f3, g3, h2);
        else {
          var i2 = document.createElement("a");
          i2.href = f3, i2.target = "_blank", setTimeout(function() {
            e2(i2);
          });
        }
      } : function(b3, d3, e3, g3) {
        if (g3 = g3 || open("", "_blank"), g3 && (g3.document.title = g3.document.body.innerText = "downloading..."), "string" == typeof b3) return c2(b3, d3, e3);
        var h2 = "application/octet-stream" === b3.type, i2 = /constructor/i.test(f2.HTMLElement) || f2.safari, j2 = /CriOS\/[\d]+/.test(navigator.userAgent);
        if ((j2 || h2 && i2 || a2) && "undefined" != typeof FileReader) {
          var k2 = new FileReader();
          k2.onloadend = function() {
            var a3 = k2.result;
            a3 = j2 ? a3 : a3.replace(/^data:[^;]*;/, "data:attachment/file;"), g3 ? g3.location.href = a3 : location = a3, g3 = null;
          }, k2.readAsDataURL(b3);
        } else {
          var l2 = f2.URL || f2.webkitURL, m2 = l2.createObjectURL(b3);
          g3 ? g3.location = m2 : location.href = m2, g3 = null, setTimeout(function() {
            l2.revokeObjectURL(m2);
          }, 4e4);
        }
      });
      f2.saveAs = g2.saveAs = g2, module.exports = g2;
    });
  })(FileSaver_min$1);
  return FileSaver_min$1.exports;
}
var FileSaver_minExports = requireFileSaver_min();
var zmodem_browser = { exports: {} };
var zmodem = { exports: {} };
var zsentry = { exports: {} };
var zmlib = { exports: {} };
var hasRequiredZmlib;
function requireZmlib() {
  if (hasRequiredZmlib) return zmlib.exports;
  hasRequiredZmlib = 1;
  (function(module) {
    var Zmodem = module.exports;
    const ZDLE = 24, XON = 17, XOFF = 19, XON_HIGH = 128 | XON, XOFF_HIGH = 128 | XOFF, CAN = 24;
    Zmodem.ZMLIB = {
      /**
       * @property {number} The ZDLE constant, which ZMODEM uses for escaping
       */
      ZDLE,
      /**
       * @property {number} XON - ASCII XON
       */
      XON,
      /**
       * @property {number} XOFF - ASCII XOFF
       */
      XOFF,
      /**
       * @property {number[]} ABORT_SEQUENCE - ZMODEM’s abort sequence
       */
      ABORT_SEQUENCE: [CAN, CAN, CAN, CAN, CAN],
      /**
       * Remove octet values from the given array that ZMODEM always ignores.
       * This will mutate the given array.
       *
       * @param {number[]} octets - The octet values to transform.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {number[]} The passed-in array. This is the same object that is
       *      passed in.
       */
      strip_ignored_bytes: function strip_ignored_bytes(octets) {
        for (var o2 = octets.length - 1; o2 >= 0; o2--) {
          switch (octets[o2]) {
            case XON:
            case XON_HIGH:
            case XOFF:
            case XOFF_HIGH:
              octets.splice(o2, 1);
              continue;
          }
        }
        return octets;
      },
      /**
       * Like Array.prototype.indexOf, but searches for a subarray
       * rather than just a particular value.
       *
       * @param {Array} haystack - The array to search, i.e., the bigger.
       *
       * @param {Array} needle - The array whose values to find,
       *      i.e., the smaller.
       *
       * @returns {number} The position in “haystack” where “needle”
       *      first appears—or, -1 if “needle” doesn’t appear anywhere
       *      in “haystack”.
       */
      find_subarray: function find_subarray(haystack, needle) {
        var h2 = 0, n2;
        HAYSTACK:
          while (h2 !== -1) {
            h2 = haystack.indexOf(needle[0], h2);
            if (h2 === -1) break HAYSTACK;
            for (n2 = 1; n2 < needle.length; n2++) {
              if (haystack[h2 + n2] !== needle[n2]) {
                h2++;
                continue HAYSTACK;
              }
            }
            return h2;
          }
        return -1;
      }
    };
  })(zmlib);
  return zmlib.exports;
}
var zsession = { exports: {} };
var encode = { exports: {} };
var hasRequiredEncode;
function requireEncode() {
  if (hasRequiredEncode) return encode.exports;
  hasRequiredEncode = 1;
  (function(module) {
    var Zmodem = module.exports;
    const HEX_DIGITS = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102];
    const HEX_OCTET_VALUE = {};
    for (var hd = 0; hd < HEX_DIGITS.length; hd++) {
      HEX_OCTET_VALUE[HEX_DIGITS[hd]] = hd;
    }
    Zmodem.ENCODELIB = {
      /**
       * Return an array with the given number as 2 big-endian bytes.
       *
       * @param {number} number - The number to encode.
       *
       * @returns {number[]} The octet values.
       */
      pack_u16_be: function pack_u16_be(number) {
        if (number > 65535) throw "Number cannot exceed 16 bits: " + number;
        return [number >> 8, number & 255];
      },
      /**
       * Return an array with the given number as 4 little-endian bytes.
       *
       * @param {number} number - The number to encode.
       *
       * @returns {number[]} The octet values.
       */
      pack_u32_le: function pack_u32_le(number) {
        var high_bytes = number / 65536;
        return [
          number & 255,
          (number & 65535) >> 8,
          high_bytes & 255,
          high_bytes >> 8
        ];
      },
      /**
       * The inverse of pack_u16_be() - i.e., take in 2 octet values
       * and parse them as an unsigned, 2-byte big-endian number.
       *
       * @param {number[]} octets - The octet values (2 of them).
       *
       * @returns {number} The decoded number.
       */
      unpack_u16_be: function unpack_u16_be(bytes_arr) {
        return (bytes_arr[0] << 8) + bytes_arr[1];
      },
      /**
       * The inverse of pack_u32_le() - i.e., take in a 4-byte sequence
       * and parse it as an unsigned, 4-byte little-endian number.
       *
       * @param {number[]} octets - The octet values (4 of them).
       *
       * @returns {number} The decoded number.
       */
      unpack_u32_le: function unpack_u32_le(octets) {
        return octets[0] + (octets[1] << 8) + (octets[2] << 16) + octets[3] * 16777216;
      },
      /**
       * Encode a series of octet values to be the octet values that
       * correspond to the ASCII hex characters for each octet. The
       * returned array is suitable for use as binary data.
       *
       * For example:
       *
       *      Original    Hex     Returned
       *      254         fe      102, 101
       *       12         0c      48, 99
       *      129         81      56, 49
       *
       * @param {number[]} octets - The original octet values.
       *
       * @returns {number[]} The octet values that correspond to an ASCII
       *  representation of the given octets.
       */
      octets_to_hex: function octets_to_hex(octets) {
        var hex = [];
        for (var o2 = 0; o2 < octets.length; o2++) {
          hex.push(
            HEX_DIGITS[octets[o2] >> 4],
            HEX_DIGITS[octets[o2] & 15]
          );
        }
        return hex;
      },
      /**
       * The inverse of octets_to_hex(): takes an array
       * of hex octet pairs and returns their octet values.
       *
       * @param {number[]} hex_octets - The hex octet values.
       *
       * @returns {number[]} The parsed octet values.
       */
      parse_hex_octets: function parse_hex_octets(hex_octets) {
        var octets = new Array(hex_octets.length / 2);
        for (var i2 = 0; i2 < octets.length; i2++) {
          octets[i2] = (HEX_OCTET_VALUE[hex_octets[2 * i2]] << 4) + HEX_OCTET_VALUE[hex_octets[1 + 2 * i2]];
        }
        return octets;
      }
    };
  })(encode);
  return encode.exports;
}
var text = { exports: {} };
var hasRequiredText;
function requireText() {
  if (hasRequiredText) return text.exports;
  hasRequiredText = 1;
  (function(module) {
    class _my_TextEncoder {
      encode(text2) {
        text2 = unescape(encodeURIComponent(text2));
        var bytes = new Array(text2.length);
        for (var b2 = 0; b2 < text2.length; b2++) {
          bytes[b2] = text2.charCodeAt(b2);
        }
        return new Uint8Array(bytes);
      }
    }
    class _my_TextDecoder {
      decode(bytes) {
        return decodeURIComponent(escape(String.fromCharCode.apply(String, bytes)));
      }
    }
    var Zmodem = module.exports;
    Zmodem.Text = {
      Encoder: typeof TextEncoder !== "undefined" ? TextEncoder : _my_TextEncoder,
      Decoder: typeof TextDecoder !== "undefined" ? TextDecoder : _my_TextDecoder
    };
  })(text);
  return text.exports;
}
var zdle = { exports: {} };
var hasRequiredZdle;
function requireZdle() {
  if (hasRequiredZdle) return zdle.exports;
  hasRequiredZdle = 1;
  (function(module) {
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireZmlib()
    );
    var encode_cur, encode_todo;
    const ZDLE = Zmodem.ZMLIB.ZDLE;
    Zmodem.ZDLE = class ZmodemZDLE {
      /**
       * Create a ZDLE encoder.
       *
       * @param {object} [config] - The initial configuration.
       * @param {object} config.escape_ctrl_chars - Whether the ZDLE encoder
       *  should escape control characters.
       */
      constructor(config) {
        this._config = {};
        if (config) {
          this.set_escape_ctrl_chars(!!config.escape_ctrl_chars);
        }
      }
      /**
       * Enable or disable control-character escaping.
       * You should probably enable this for sender sessions.
       *
       * @param {boolean} value - Whether to enable (true) or disable (false).
       */
      set_escape_ctrl_chars(value) {
        if (typeof value !== "boolean") throw "need boolean!";
        if (value !== this._config.escape_ctrl_chars) {
          this._config.escape_ctrl_chars = value;
          this._setup_zdle_table();
        }
      }
      /**
       * Whether or not control-character escaping is enabled.
       *
       * @return {boolean} Whether the escaping is on (true) or off (false).
       */
      escapes_ctrl_chars() {
        return !!this._config.escape_ctrl_chars;
      }
      //I don’t know of any Zmodem implementations that use ZESC8
      //(“escape_8th_bit”)??
      /*
      ZMODEM software escapes ZDLE, 020, 0220, 021, 0221, 023, and 0223.  If
      preceded by 0100 or 0300 (@), 015 and 0215 are also escaped to protect the
      Telenet command escape CR-@-CR.
      */
      /**
       * Encode an array of octet values and return it.
       * This will mutate the given array.
       *
       * @param {number[]} octets - The octet values to transform.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {number[]} The passed-in array, transformed. This is the
       *  same object that is passed in.
       */
      encode(octets) {
        if (!this._zdle_table) throw "No ZDLE encode table configured!";
        var zdle_table = this._zdle_table;
        var last_code = this._lastcode;
        var arrbuf = new ArrayBuffer(2 * octets.length);
        var arrbuf_uint8 = new Uint8Array(arrbuf);
        var escctl_yn = this._config.escape_ctrl_chars;
        var arrbuf_i = 0;
        for (encode_cur = 0; encode_cur < octets.length; encode_cur++) {
          encode_todo = zdle_table[octets[encode_cur]];
          if (!encode_todo) {
            console.trace();
            console.error("bad encode() call:", JSON.stringify(octets));
            this._lastcode = last_code;
            throw "Invalid octet: " + octets[encode_cur];
          }
          last_code = octets[encode_cur];
          if (encode_todo === 1) ;
          else if (escctl_yn || encode_todo === 2 || (last_code & 127) === 64) {
            arrbuf_uint8[arrbuf_i] = ZDLE;
            arrbuf_i++;
            last_code ^= 64;
          }
          arrbuf_uint8[arrbuf_i] = last_code;
          arrbuf_i++;
        }
        this._lastcode = last_code;
        octets.splice(0);
        octets.push.apply(octets, new Uint8Array(arrbuf, 0, arrbuf_i));
        return octets;
      }
      /**
       * Decode an array of octet values and return it.
       * This will mutate the given array.
       *
       * @param {number[]} octets - The octet values to transform.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {number[]} The passed-in array.
       *  This is the same object that is passed in.
       */
      static decode(octets) {
        for (var o2 = octets.length - 1; o2 >= 0; o2--) {
          if (octets[o2] === ZDLE) {
            octets.splice(o2, 2, octets[o2 + 1] - 64);
          }
        }
        return octets;
      }
      /**
       * Remove, ZDLE-decode, and return bytes from the passed-in array.
       * If the requested number of ZDLE-encoded bytes isn’t available,
       * then the passed-in array is unmodified (and the return is undefined).
       *
       * @param {number[]} octets - The octet values to transform.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @param {number} offset - The number of (undecoded) bytes to skip
       *      at the beginning of the “octets” array.
       *
       * @param {number} count - The number of bytes (octet values) to return.
       *
       * @returns {number[]|undefined} An array with the requested number of
       *      decoded octet values, or undefined if that number of decoded
       *      octets isn’t available (given the passed-in offset).
       */
      static splice(octets, offset, count) {
        var so_far = 0;
        if (!offset) offset = 0;
        for (var i2 = offset; i2 < octets.length && so_far < count; i2++) {
          so_far++;
          if (octets[i2] === ZDLE) i2++;
        }
        if (so_far === count) {
          if (octets.length === i2 - 1) return;
          octets.splice(0, offset);
          return ZmodemZDLE.decode(octets.splice(0, i2 - offset));
        }
        return;
      }
      _setup_zdle_table() {
        var zsendline_tab = new Array(256);
        for (var i2 = 0; i2 < zsendline_tab.length; i2++) {
          if (i2 & 96) {
            zsendline_tab[i2] = 1;
          } else {
            switch (i2) {
              case ZDLE:
              //NB: no (ZDLE | 0x80)
              case Zmodem.ZMLIB.XOFF:
              case Zmodem.ZMLIB.XON:
              case Zmodem.ZMLIB.XOFF | 128:
              case Zmodem.ZMLIB.XON | 128:
                zsendline_tab[i2] = 2;
                break;
              case 16:
              // 020
              case 144:
                zsendline_tab[i2] = this._config.turbo_escape ? 1 : 2;
                break;
              case 13:
              // 015
              case 141:
                zsendline_tab[i2] = this._config.escape_ctrl_chars ? 2 : !this._config.turbo_escape ? 3 : 1;
                break;
              default:
                zsendline_tab[i2] = this._config.escape_ctrl_chars ? 2 : 1;
            }
          }
        }
        this._zdle_table = zsendline_tab;
      }
    };
  })(zdle);
  return zdle.exports;
}
var zheader = { exports: {} };
var zcrc = { exports: {} };
var crc32 = {};
var hasRequiredCrc32;
function requireCrc32() {
  if (hasRequiredCrc32) return crc32;
  hasRequiredCrc32 = 1;
  (function(exports) {
    (function(factory) {
      if (typeof DO_NOT_EXPORT_CRC === "undefined") {
        {
          factory(exports);
        }
      } else {
        factory({});
      }
    })(function(CRC32) {
      CRC32.version = "1.2.2";
      function signed_crc_table() {
        var c2 = 0, table = new Array(256);
        for (var n2 = 0; n2 != 256; ++n2) {
          c2 = n2;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          c2 = c2 & 1 ? -306674912 ^ c2 >>> 1 : c2 >>> 1;
          table[n2] = c2;
        }
        return typeof Int32Array !== "undefined" ? new Int32Array(table) : table;
      }
      var T0 = signed_crc_table();
      function slice_by_16_tables(T10) {
        var c2 = 0, v2 = 0, n2 = 0, table = typeof Int32Array !== "undefined" ? new Int32Array(4096) : new Array(4096);
        for (n2 = 0; n2 != 256; ++n2) table[n2] = T10[n2];
        for (n2 = 0; n2 != 256; ++n2) {
          v2 = T10[n2];
          for (c2 = 256 + n2; c2 < 4096; c2 += 256) v2 = table[c2] = v2 >>> 8 ^ T10[v2 & 255];
        }
        var out = [];
        for (n2 = 1; n2 != 16; ++n2) out[n2 - 1] = typeof Int32Array !== "undefined" ? table.subarray(n2 * 256, n2 * 256 + 256) : table.slice(n2 * 256, n2 * 256 + 256);
        return out;
      }
      var TT = slice_by_16_tables(T0);
      var T1 = TT[0], T2 = TT[1], T3 = TT[2], T4 = TT[3], T5 = TT[4];
      var T6 = TT[5], T7 = TT[6], T8 = TT[7], T9 = TT[8], Ta = TT[9];
      var Tb = TT[10], Tc = TT[11], Td = TT[12], Te2 = TT[13], Tf = TT[14];
      function crc32_bstr(bstr, seed) {
        var C2 = seed ^ -1;
        for (var i2 = 0, L2 = bstr.length; i2 < L2; ) C2 = C2 >>> 8 ^ T0[(C2 ^ bstr.charCodeAt(i2++)) & 255];
        return ~C2;
      }
      function crc32_buf(B2, seed) {
        var C2 = seed ^ -1, L2 = B2.length - 15, i2 = 0;
        for (; i2 < L2; ) C2 = Tf[B2[i2++] ^ C2 & 255] ^ Te2[B2[i2++] ^ C2 >> 8 & 255] ^ Td[B2[i2++] ^ C2 >> 16 & 255] ^ Tc[B2[i2++] ^ C2 >>> 24] ^ Tb[B2[i2++]] ^ Ta[B2[i2++]] ^ T9[B2[i2++]] ^ T8[B2[i2++]] ^ T7[B2[i2++]] ^ T6[B2[i2++]] ^ T5[B2[i2++]] ^ T4[B2[i2++]] ^ T3[B2[i2++]] ^ T2[B2[i2++]] ^ T1[B2[i2++]] ^ T0[B2[i2++]];
        L2 += 15;
        while (i2 < L2) C2 = C2 >>> 8 ^ T0[(C2 ^ B2[i2++]) & 255];
        return ~C2;
      }
      function crc32_str(str, seed) {
        var C2 = seed ^ -1;
        for (var i2 = 0, L2 = str.length, c2 = 0, d2 = 0; i2 < L2; ) {
          c2 = str.charCodeAt(i2++);
          if (c2 < 128) {
            C2 = C2 >>> 8 ^ T0[(C2 ^ c2) & 255];
          } else if (c2 < 2048) {
            C2 = C2 >>> 8 ^ T0[(C2 ^ (192 | c2 >> 6 & 31)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | c2 & 63)) & 255];
          } else if (c2 >= 55296 && c2 < 57344) {
            c2 = (c2 & 1023) + 64;
            d2 = str.charCodeAt(i2++) & 1023;
            C2 = C2 >>> 8 ^ T0[(C2 ^ (240 | c2 >> 8 & 7)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | c2 >> 2 & 63)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | d2 >> 6 & 15 | (c2 & 3) << 4)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | d2 & 63)) & 255];
          } else {
            C2 = C2 >>> 8 ^ T0[(C2 ^ (224 | c2 >> 12 & 15)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | c2 >> 6 & 63)) & 255];
            C2 = C2 >>> 8 ^ T0[(C2 ^ (128 | c2 & 63)) & 255];
          }
        }
        return ~C2;
      }
      CRC32.table = T0;
      CRC32.bstr = crc32_bstr;
      CRC32.buf = crc32_buf;
      CRC32.str = crc32_str;
    });
  })(crc32);
  return crc32;
}
var zerror = { exports: {} };
var hasRequiredZerror;
function requireZerror() {
  if (hasRequiredZerror) return zerror.exports;
  hasRequiredZerror = 1;
  (function(module) {
    var Zmodem = module.exports;
    function _crc_message(got, expected) {
      this.got = got.slice(0);
      this.expected = expected.slice(0);
      return "CRC check failed! (got: " + got.join() + "; expected: " + expected.join() + ")";
    }
    function _pass(val) {
      return val;
    }
    const TYPE_MESSAGE = {
      aborted: "Session aborted",
      peer_aborted: "Peer aborted session",
      already_aborted: "Session already aborted",
      crc: _crc_message,
      validation: _pass
    };
    function _generate_message(type) {
      const msg = TYPE_MESSAGE[type];
      switch (typeof msg) {
        case "string":
          return msg;
        case "function":
          var args_after_type = [].slice.call(arguments).slice(1);
          return msg.apply(this, args_after_type);
      }
      return null;
    }
    Zmodem.Error = class ZmodemError extends Error {
      constructor(msg_or_type) {
        super();
        var generated = _generate_message.apply(this, arguments);
        if (generated) {
          this.type = msg_or_type;
          this.message = generated;
        } else {
          this.message = msg_or_type;
        }
      }
    };
  })(zerror);
  return zerror.exports;
}
var hasRequiredZcrc;
function requireZcrc() {
  if (hasRequiredZcrc) return zcrc.exports;
  hasRequiredZcrc = 1;
  (function(module) {
    const CRC32_MOD = requireCrc32();
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireZerror(),
      requireEncode()
    );
    var _crctab;
    const crc_width = 16, crc_polynomial = 4129, crc_castmask = 65535, crc_msbmask = 1 << crc_width - 1;
    function _compute_crctab() {
      _crctab = new Array(256);
      var divident_shift = crc_width - 8;
      for (var divident = 0; divident < 256; divident++) {
        var currByte = divident << divident_shift & crc_castmask;
        for (var bit = 0; bit < 8; bit++) {
          if ((currByte & crc_msbmask) !== 0) {
            currByte <<= 1;
            currByte ^= crc_polynomial;
          } else {
            currByte <<= 1;
          }
        }
        _crctab[divident] = currByte & crc_castmask;
      }
    }
    function _updcrc(cp, crc) {
      if (!_crctab) _compute_crctab();
      return _crctab[crc >> 8 & 255] ^ (255 & crc) << 8 ^ cp;
    }
    function __verify(expect, got) {
      if (expect.join() !== got.join()) {
        throw new Zmodem.Error("crc", got, expect);
      }
    }
    Zmodem.CRC = {
      //https://www.lammertbies.nl/comm/info/crc-calculation.html
      //CRC-CCITT (XModem)
      /**
       * Deduce a given set of octet values’ CRC16, as per the CRC16
       * variant that ZMODEM uses (CRC-CCITT/XModem).
       *
       * @param {Array} octets - The array of octet values.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *
       * @returns {Array} crc - The CRC, expressed as an array of octet values.
       */
      crc16: function crc16(octet_nums) {
        var crc = octet_nums[0];
        for (var b2 = 1; b2 < octet_nums.length; b2++) {
          crc = _updcrc(octet_nums[b2], crc);
        }
        crc = _updcrc(0, _updcrc(0, crc));
        return Zmodem.ENCODELIB.pack_u16_be(crc);
      },
      /**
       * Deduce a given set of octet values’ CRC32.
       *
       * @param {Array} octets - The array of octet values.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *
       * @returns {Array} crc - The CRC, expressed as an array of octet values.
       */
      crc32: function crc322(octet_nums) {
        return Zmodem.ENCODELIB.pack_u32_le(
          CRC32_MOD.buf(octet_nums) >>> 0
          //bit-shift to get unsigned
        );
      },
      /**
       * Verify a given set of octet values’ CRC16.
       * An exception is thrown on failure.
       *
       * @param {Array} bytes_arr - The array of octet values.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *
       * @param {Array} crc - The CRC to check against, expressed as
       *      an array of octet values.
       */
      verify16: function verify16(bytes_arr, got) {
        return __verify(this.crc16(bytes_arr), got);
      },
      /**
       * Verify a given set of octet values’ CRC32.
       * An exception is thrown on failure.
       *
       * @param {Array} bytes_arr - The array of octet values.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *
       * @param {Array} crc - The CRC to check against, expressed as
       *      an array of octet values.
       */
      verify32: function verify32(bytes_arr, crc) {
        try {
          __verify(this.crc32(bytes_arr), crc);
        } catch (err) {
          err.input = bytes_arr.slice(0);
          throw err;
        }
      }
    };
  })(zcrc);
  return zcrc.exports;
}
var hasRequiredZheader;
function requireZheader() {
  if (hasRequiredZheader) return zheader.exports;
  hasRequiredZheader = 1;
  (function(module) {
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireEncode(),
      requireZdle(),
      requireZmlib(),
      requireZcrc(),
      requireZerror()
    );
    const ZPAD = "*".charCodeAt(0), ZBIN = "A".charCodeAt(0), ZHEX = "B".charCodeAt(0), ZBIN32 = "C".charCodeAt(0);
    const HEX_HEADER_CRLF = [13, 10];
    const HEX_HEADER_CRLF_XON = HEX_HEADER_CRLF.slice(0).concat([Zmodem.ZMLIB.XON]);
    const HEX_HEADER_PREFIX = [ZPAD, ZPAD, Zmodem.ZMLIB.ZDLE, ZHEX];
    const BINARY16_HEADER_PREFIX = [ZPAD, Zmodem.ZMLIB.ZDLE, ZBIN];
    const BINARY32_HEADER_PREFIX = [ZPAD, Zmodem.ZMLIB.ZDLE, ZBIN32];
    Zmodem.Header = class ZmodemHeader {
      //lrzsz’s “sz” command sends a random (?) CR/0x0d byte
      //after ZEOF. Let’s accommodate 0x0a, 0x0d, 0x8a, and 0x8d.
      //
      //Also, when you skip a file, sz outputs a message about it.
      //
      //It appears that we’re supposed to ignore anything until
      //[ ZPAD, ZDLE ] when we’re looking for a header.
      /**
       * Weed out the leading bytes that aren’t valid to start a ZMODEM header.
       *
       * @param {number[]} ibuffer - The octet values to parse.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {number[]} The octet values that were removed from the start
       *      of “ibuffer”. Order is preserved.
       */
      static trim_leading_garbage(ibuffer) {
        var garbage = [];
        var discard_all, parser;
        TRIM_LOOP:
          while (ibuffer.length && !parser) {
            var first_ZPAD = ibuffer.indexOf(ZPAD);
            if (first_ZPAD === -1) {
              discard_all = true;
              break TRIM_LOOP;
            } else {
              garbage.push.apply(garbage, ibuffer.splice(0, first_ZPAD));
              if (ibuffer.length < 2) {
                break TRIM_LOOP;
              } else if (ibuffer[1] === ZPAD) {
                if (ibuffer.length < HEX_HEADER_PREFIX.length) {
                  if (ibuffer.join() === HEX_HEADER_PREFIX.slice(0, ibuffer.length).join()) {
                    break TRIM_LOOP;
                  }
                } else if (ibuffer[2] === HEX_HEADER_PREFIX[2] && ibuffer[3] === HEX_HEADER_PREFIX[3]) {
                  parser = _parse_hex;
                }
              } else if (ibuffer[1] === Zmodem.ZMLIB.ZDLE) {
                if (ibuffer.length < BINARY16_HEADER_PREFIX.length) {
                  break TRIM_LOOP;
                }
                if (ibuffer[2] === BINARY16_HEADER_PREFIX[2]) {
                  parser = _parse_binary16;
                } else if (ibuffer[2] === BINARY32_HEADER_PREFIX[2]) {
                  parser = _parse_binary32;
                }
              }
              if (!parser) {
                garbage.push(ibuffer.shift());
              }
            }
          }
        if (discard_all) {
          garbage.push.apply(garbage, ibuffer.splice(0));
        }
        return garbage;
      }
      /**
       * Parse out a Header object from a given array of octet values.
       *
       * An exception is thrown if the given bytes are definitively invalid
       * as header values.
       *
       * @param {number[]} octets - The octet values to parse.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {Header|undefined} An instance of the appropriate Header
       *      subclass, or undefined if not enough octet values are given
       *      to determine whether there is a valid header here or not.
       */
      static parse(octets) {
        var hdr;
        if (octets[1] === ZPAD) {
          hdr = _parse_hex(octets);
          return hdr && [hdr, 16];
        } else if (octets[2] === ZBIN) {
          hdr = _parse_binary16(octets);
          return hdr && [hdr, 16];
        } else if (octets[2] === ZBIN32) {
          hdr = _parse_binary32(octets);
          return hdr && [hdr, 32];
        }
        if (octets.length < 3) return;
        throw "Unrecognized/unsupported octets: " + octets.join();
      }
      /**
       * Build a Header subclass given a name and arguments.
       *
       * @param {string} name - The header type name, e.g., “ZRINIT”.
       *
       * @param {...*} args - The arguments to pass to the appropriate
       *      subclass constructor. These aren’t documented currently
       *      but are pretty easy to glean from the code.
       *
       * @returns {Header} An instance of the appropriate Header subclass.
       */
      static build(name2) {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        var Ctr = FRAME_NAME_CREATOR[name2];
        if (!Ctr) throw "No frame class “" + name2 + "” is defined!";
        args.shift();
        var hdr = new (Ctr.bind.apply(Ctr, [null].concat(args)))();
        return hdr;
      }
      /**
       * Return the octet values array that represents the object
       * in ZMODEM hex encoding.
       *
       * @returns {number[]} An array of octet values suitable for sending
       *      as binary data.
       */
      to_hex() {
        var to_crc = this._crc_bytes();
        return HEX_HEADER_PREFIX.concat(
          Zmodem.ENCODELIB.octets_to_hex(to_crc.concat(Zmodem.CRC.crc16(to_crc))),
          this._hex_header_ending
        );
      }
      /**
       * Return the octet values array that represents the object
       * in ZMODEM binary encoding with a 16-bit CRC.
       *
       * @param {ZDLE} zencoder - A ZDLE instance to use for
       *      ZDLE encoding.
       *
       * @returns {number[]} An array of octet values suitable for sending
       *      as binary data.
       */
      to_binary16(zencoder) {
        return this._to_binary(zencoder, BINARY16_HEADER_PREFIX, Zmodem.CRC.crc16);
      }
      /**
       * Return the octet values array that represents the object
       * in ZMODEM binary encoding with a 32-bit CRC.
       *
       * @param {ZDLE} zencoder - A ZDLE instance to use for
       *      ZDLE encoding.
       *
       * @returns {number[]} An array of octet values suitable for sending
       *      as binary data.
       */
      to_binary32(zencoder) {
        return this._to_binary(zencoder, BINARY32_HEADER_PREFIX, Zmodem.CRC.crc32);
      }
      //This is never called directly, but only as super().
      constructor() {
        if (!this._bytes4) {
          this._bytes4 = [0, 0, 0, 0];
        }
      }
      _to_binary(zencoder, prefix, crc_func) {
        var to_crc = this._crc_bytes();
        var octets = prefix.concat(
          zencoder.encode(to_crc.concat(crc_func(to_crc)))
        );
        return octets;
      }
      _crc_bytes() {
        return [this.TYPENUM].concat(this._bytes4);
      }
    };
    Zmodem.Header.prototype._hex_header_ending = HEX_HEADER_CRLF_XON;
    class ZRQINIT_HEADER extends Zmodem.Header {
    }
    const ZRINIT_FLAG = {
      //----------------------------------------------------------------------
      // Bit Masks for ZRINIT flags byte ZF0
      //----------------------------------------------------------------------
      CANFDX: 1,
      // Rx can send and receive true FDX
      CANOVIO: 2,
      // Rx can receive data during disk I/O
      CANBRK: 4,
      // Rx can send a break signal
      CANCRY: 8,
      // Receiver can decrypt -- nothing does this
      CANLZW: 16,
      // Receiver can uncompress -- nothing does this
      CANFC32: 32,
      // Receiver can use 32 bit Frame Check
      ESCCTL: 64,
      // Receiver expects ctl chars to be escaped
      ESC8: 128
      // Receiver expects 8th bit to be escaped
    };
    function _get_ZRINIT_flag_num(fl) {
      if (!ZRINIT_FLAG[fl]) {
        throw new Zmodem.Error("Invalid ZRINIT flag: " + fl);
      }
      return ZRINIT_FLAG[fl];
    }
    class ZRINIT_HEADER extends Zmodem.Header {
      constructor(flags_arr, bufsize) {
        super();
        var flags_num = 0;
        if (!bufsize) bufsize = 0;
        flags_arr.forEach(function(fl) {
          flags_num |= _get_ZRINIT_flag_num(fl);
        });
        this._bytes4 = [
          bufsize & 255,
          bufsize >> 8,
          0,
          flags_num
        ];
      }
      //undefined if nonstop I/O is allowed
      get_buffer_size() {
        return Zmodem.ENCODELIB.unpack_u16_be(this._bytes4.slice(0, 2)) || void 0;
      }
      //Unimplemented:
      //  can_decrypt
      //  can_decompress
      //----------------------------------------------------------------------
      //function names taken from Jacques Mattheij’s implementation,
      //as used in syncterm.
      can_full_duplex() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.CANFDX);
      }
      can_overlap_io() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.CANOVIO);
      }
      can_break() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.CANBRK);
      }
      can_fcs_32() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.CANFC32);
      }
      escape_ctrl_chars() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.ESCCTL);
      }
      //Is this used? I don’t see it used in lrzsz or syncterm
      //Looks like it was a “foreseen” feature that Forsberg
      //never implemented. (The need for it went away, maybe?)
      escape_8th_bit() {
        return !!(this._bytes4[3] & ZRINIT_FLAG.ESC8);
      }
    }
    const ZSINIT_FLAG = {
      ESCCTL: 64,
      // Transmitter will escape ctl chars
      ESC8: 128
      // Transmitter will escape 8th bit
    };
    function _get_ZSINIT_flag_num(fl) {
      if (!ZSINIT_FLAG[fl]) {
        throw "Invalid ZSINIT flag: " + fl;
      }
      return ZSINIT_FLAG[fl];
    }
    class ZSINIT_HEADER extends Zmodem.Header {
      constructor(flags_arr, attn_seq_arr) {
        super();
        var flags_num = 0;
        flags_arr.forEach(function(fl) {
          flags_num |= _get_ZSINIT_flag_num(fl);
        });
        this._bytes4 = [0, 0, 0, flags_num];
        if (attn_seq_arr) {
          if (attn_seq_arr.length > 31) {
            throw "Attn sequence must be <= 31 bytes";
          }
          if (attn_seq_arr.some(function(num) {
            return num > 255;
          })) {
            throw "Attn sequence (" + attn_seq_arr + ") must be <256";
          }
          this._data = attn_seq_arr.concat([0]);
        }
      }
      escape_ctrl_chars() {
        return !!(this._bytes4[3] & ZSINIT_FLAG.ESCCTL);
      }
      //Is this used? I don’t see it used in lrzsz or syncterm
      escape_8th_bit() {
        return !!(this._bytes4[3] & ZSINIT_FLAG.ESC8);
      }
    }
    class ZACK_HEADER extends Zmodem.Header {
      constructor(payload4) {
        super();
        if (payload4) {
          this._bytes4 = payload4.slice();
        }
      }
    }
    ZACK_HEADER.prototype._hex_header_ending = HEX_HEADER_CRLF;
    const ZFILE_VALUES = {
      //ZF3 (i.e., first byte)
      extended: {
        sparse: 64
        //ZXSPARS
      },
      //ZF2
      transport: [
        void 0,
        "compress",
        //ZTLZW
        "encrypt",
        //ZTCRYPT
        "rle"
        //ZTRLE
      ],
      //ZF1
      management: [
        void 0,
        "newer_or_longer",
        //ZF1_ZMNEWL
        "crc",
        //ZF1_ZMCRC
        "append",
        //ZF1_ZMAPND
        "clobber",
        //ZF1_ZMCLOB
        "newer",
        //ZF1_ZMNEW
        "mtime_or_length",
        //ZF1_ZMNEW
        "protect",
        //ZF1_ZMPROT
        "rename"
        //ZF1_ZMPROT
      ],
      //ZF0 (i.e., last byte)
      conversion: [
        void 0,
        "binary",
        //ZCBIN
        "text",
        //ZCNL
        "resume"
        //ZCRESUM
      ]
    };
    const ZFILE_ORDER = ["extended", "transport", "management", "conversion"];
    const ZMSKNOLOC = 128, MANAGEMENT_MASK = 31, ZXSPARS = 64;
    class ZFILE_HEADER extends Zmodem.Header {
      //TODO: allow options on instantiation
      get_options() {
        var opts = {
          sparse: !!(this._bytes4[0] & ZXSPARS)
        };
        var bytes_copy = this._bytes4.slice(0);
        ZFILE_ORDER.forEach(function(key, i2) {
          if (ZFILE_VALUES[key] instanceof Array) {
            if (key === "management") {
              opts.skip_if_absent = !!(bytes_copy[i2] & ZMSKNOLOC);
              bytes_copy[i2] &= MANAGEMENT_MASK;
            }
            opts[key] = ZFILE_VALUES[key][bytes_copy[i2]];
          } else {
            for (var extkey in ZFILE_VALUES[key]) {
              opts[extkey] = !!(bytes_copy[i2] & ZFILE_VALUES[key][extkey]);
              if (opts[extkey]) {
                bytes_copy[i2] ^= ZFILE_VALUES[key][extkey];
              }
            }
          }
          if (!opts[key] && bytes_copy[i2]) {
            opts[key] = "unknown:" + bytes_copy[i2];
          }
        });
        return opts;
      }
    }
    class ZSKIP_HEADER extends Zmodem.Header {
    }
    class ZABORT_HEADER extends Zmodem.Header {
    }
    class ZFIN_HEADER extends Zmodem.Header {
    }
    class ZFERR_HEADER extends Zmodem.Header {
    }
    ZFIN_HEADER.prototype._hex_header_ending = HEX_HEADER_CRLF;
    class ZOffsetHeader extends Zmodem.Header {
      constructor(offset) {
        super();
        this._bytes4 = Zmodem.ENCODELIB.pack_u32_le(offset);
      }
      get_offset() {
        return Zmodem.ENCODELIB.unpack_u32_le(this._bytes4);
      }
    }
    class ZRPOS_HEADER extends ZOffsetHeader {
    }
    class ZDATA_HEADER extends ZOffsetHeader {
    }
    class ZEOF_HEADER extends ZOffsetHeader {
    }
    const FRAME_CLASS_TYPES = [
      [ZRQINIT_HEADER, "ZRQINIT"],
      [ZRINIT_HEADER, "ZRINIT"],
      [ZSINIT_HEADER, "ZSINIT"],
      [ZACK_HEADER, "ZACK"],
      [ZFILE_HEADER, "ZFILE"],
      [ZSKIP_HEADER, "ZSKIP"],
      void 0,
      // [ ZNAK_HEADER, "ZNAK" ],
      [ZABORT_HEADER, "ZABORT"],
      [ZFIN_HEADER, "ZFIN"],
      [ZRPOS_HEADER, "ZRPOS"],
      [ZDATA_HEADER, "ZDATA"],
      [ZEOF_HEADER, "ZEOF"],
      [ZFERR_HEADER, "ZFERR"],
      //see note
      void 0,
      //[ ZCRC_HEADER, "ZCRC" ],
      void 0,
      //[ ZCHALLENGE_HEADER, "ZCHALLENGE" ],
      void 0,
      //[ ZCOMPL_HEADER, "ZCOMPL" ],
      void 0,
      //[ ZCAN_HEADER, "ZCAN" ],
      void 0,
      //[ ZFREECNT_HEADER, "ZFREECNT" ],
      void 0,
      //[ ZCOMMAND_HEADER, "ZCOMMAND" ],
      void 0
      //[ ZSTDERR_HEADER, "ZSTDERR" ],
    ];
    var FRAME_NAME_CREATOR = {};
    for (var fc = 0; fc < FRAME_CLASS_TYPES.length; fc++) {
      if (!FRAME_CLASS_TYPES[fc]) continue;
      FRAME_NAME_CREATOR[FRAME_CLASS_TYPES[fc][1]] = FRAME_CLASS_TYPES[fc][0];
      Object.assign(
        FRAME_CLASS_TYPES[fc][0].prototype,
        {
          TYPENUM: fc,
          NAME: FRAME_CLASS_TYPES[fc][1]
        }
      );
    }
    const CREATORS = [
      ZRQINIT_HEADER,
      ZRINIT_HEADER,
      ZSINIT_HEADER,
      ZACK_HEADER,
      ZFILE_HEADER,
      ZSKIP_HEADER,
      "ZNAK",
      ZABORT_HEADER,
      ZFIN_HEADER,
      ZRPOS_HEADER,
      ZDATA_HEADER,
      ZEOF_HEADER,
      ZFERR_HEADER,
      "ZCRC",
      //ZCRC_HEADER, -- leaving unimplemented?
      "ZCHALLENGE",
      "ZCOMPL",
      "ZCAN",
      "ZFREECNT",
      // ZFREECNT_HEADER,
      "ZCOMMAND",
      "ZSTDERR"
    ];
    function _get_blank_header(typenum) {
      var creator = CREATORS[typenum];
      if (typeof creator === "string") {
        throw "Received unsupported header: " + creator;
      }
      return _get_blank_header_from_constructor(creator);
    }
    function _get_blank_header_from_constructor(creator) {
      if (creator.prototype instanceof ZOffsetHeader) {
        return new creator(0);
      }
      return new creator([]);
    }
    function _parse_binary16(bytes_arr) {
      var zdle_decoded = Zmodem.ZDLE.splice(bytes_arr, BINARY16_HEADER_PREFIX.length, 7);
      return zdle_decoded && _parse_non_zdle_binary16(zdle_decoded);
    }
    function _parse_non_zdle_binary16(decoded) {
      Zmodem.CRC.verify16(
        decoded.slice(0, 5),
        decoded.slice(5)
      );
      var typenum = decoded[0];
      var hdr = _get_blank_header(typenum);
      hdr._bytes4 = decoded.slice(1, 5);
      return hdr;
    }
    function _parse_binary32(bytes_arr) {
      var zdle_decoded = Zmodem.ZDLE.splice(
        bytes_arr,
        //omit the leading "*", ZDLE, and "C"
        BINARY32_HEADER_PREFIX.length,
        9
      );
      if (!zdle_decoded) return;
      Zmodem.CRC.verify32(
        zdle_decoded.slice(0, 5),
        zdle_decoded.slice(5)
      );
      var typenum = zdle_decoded[0];
      var hdr = _get_blank_header(typenum);
      hdr._bytes4 = zdle_decoded.slice(1, 5);
      return hdr;
    }
    function _parse_hex(bytes_arr) {
      var lf_pos = bytes_arr.indexOf(138);
      if (-1 === lf_pos) {
        lf_pos = bytes_arr.indexOf(10);
      }
      var hdr_err, hex_bytes;
      if (-1 === lf_pos) {
        if (bytes_arr.length > 11) {
          hdr_err = "Invalid hex header - no LF detected within 12 bytes!";
        }
        return;
      } else {
        hex_bytes = bytes_arr.splice(0, lf_pos);
        bytes_arr.shift();
        if (hex_bytes.length === 19) {
          var preceding = hex_bytes.pop();
          if (preceding !== 13 && preceding !== 141) {
            hdr_err = "Invalid hex header: (CR/)LF doesn’t have CR!";
          }
        } else if (hex_bytes.length !== 18) {
          hdr_err = "Invalid hex header: invalid number of bytes before LF!";
        }
      }
      if (hdr_err) {
        hdr_err += " (" + hex_bytes.length + " bytes: " + hex_bytes.join() + ")";
        throw hdr_err;
      }
      hex_bytes.splice(0, 4);
      var octets = Zmodem.ENCODELIB.parse_hex_octets(hex_bytes);
      return _parse_non_zdle_binary16(octets);
    }
    Zmodem.Header.parse_hex = _parse_hex;
  })(zheader);
  return zheader.exports;
}
var zsubpacket = { exports: {} };
var hasRequiredZsubpacket;
function requireZsubpacket() {
  if (hasRequiredZsubpacket) return zsubpacket.exports;
  hasRequiredZsubpacket = 1;
  (function(module) {
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireZcrc(),
      requireZdle(),
      requireZmlib(),
      requireZerror()
    );
    const ZCRCE = 104, ZCRCG = 105, ZCRCQ = 106, ZCRCW = 107;
    var SUBPACKET_BUILDER;
    Zmodem.Subpacket = class ZmodemSubpacket {
      /**
       * Build a Subpacket subclass given a payload and frame end string.
       *
       * @param {Array} octets - The octet values to parse.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *
       * @param {string} frameend - One of:
       * - `no_end_no_ack`
       * - `end_no_ack`
       * - `no_end_ack` (unused currently)
       * - `end_ack`
       *
       * @returns {Subpacket} An instance of the appropriate Subpacket subclass.
       */
      static build(octets, frameend) {
        var Ctr = SUBPACKET_BUILDER[frameend];
        if (!Ctr) {
          throw "No subpacket type “" + frameend + "” is defined! Try one of: " + Object.keys(SUBPACKET_BUILDER).join(", ");
        }
        return new Ctr(octets);
      }
      /**
       * Return the octet values array that represents the object
       * encoded with a 16-bit CRC.
       *
       * @param {ZDLE} zencoder - A ZDLE instance to use for ZDLE encoding.
       *
       * @returns {number[]} An array of octet values suitable for sending
       *      as binary data.
       */
      encode16(zencoder) {
        return this._encode(zencoder, Zmodem.CRC.crc16);
      }
      /**
       * Return the octet values array that represents the object
       * encoded with a 32-bit CRC.
       *
       * @param {ZDLE} zencoder - A ZDLE instance to use for ZDLE encoding.
       *
       * @returns {number[]} An array of octet values suitable for sending
       *      as binary data.
       */
      encode32(zencoder) {
        return this._encode(zencoder, Zmodem.CRC.crc32);
      }
      /**
       * Return the subpacket payload’s octet values.
       *
       * NOTE: For speed, this returns the actual data in the subpacket;
       * if you mutate this return value, you alter the Subpacket object
       * internals. This is OK if you won’t need the Subpacket anymore, but
       * just be careful.
       *
       * @returns {number[]} The subpacket’s payload, represented as an
       * array of octet values. **DO NOT ALTER THIS ARRAY** unless you
       * no longer need the Subpacket.
       */
      get_payload() {
        return this._payload;
      }
      /**
       * Parse out a Subpacket object from a given array of octet values,
       * assuming a 16-bit CRC.
       *
       * An exception is thrown if the given bytes are definitively invalid
       * as subpacket values with 16-bit CRC.
       *
       * @param {number[]} octets - The octet values to parse.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {Subpacket|undefined} An instance of the appropriate Subpacket
       *      subclass, or undefined if not enough octet values are given
       *      to determine whether there is a valid subpacket here or not.
       */
      static parse16(octets) {
        return ZmodemSubpacket._parse(octets, 2);
      }
      //parse32 test:
      //[102, 105, 108, 101, 110, 97, 109, 101, 119, 105, 116, 104, 115, 112, 97, 99, 101, 115, 0, 49, 55, 49, 51, 49, 52, 50, 52, 51, 50, 49, 55, 50, 49, 48, 48, 54, 52, 52, 48, 49, 49, 55, 0, 43, 8, 63, 115, 23, 17]
      /**
       * Same as parse16(), but assuming a 32-bit CRC.
       *
       * @param {number[]} octets - The octet values to parse.
       *      Each array member should be an 8-bit unsigned integer (0-255).
       *      This object is mutated in the function.
       *
       * @returns {Subpacket|undefined} An instance of the appropriate Subpacket
       *      subclass, or undefined if not enough octet values are given
       *      to determine whether there is a valid subpacket here or not.
       */
      static parse32(octets) {
        return ZmodemSubpacket._parse(octets, 4);
      }
      /**
       * Not used directly.
       */
      constructor(payload) {
        this._payload = payload;
      }
      _encode(zencoder, crc_func) {
        return zencoder.encode(this._payload.slice(0)).concat(
          [Zmodem.ZMLIB.ZDLE, this._frameend_num],
          zencoder.encode(crc_func(this._payload.concat(this._frameend_num)))
        );
      }
      //Because of ZDLE encoding, we’ll never see any of the frame-end octets
      //in a stream except as the ends of data payloads.
      static _parse(bytes_arr, crc_len) {
        var end_at;
        var creator;
        var _frame_ends_lookup = {
          104: ZEndNoAckSubpacket,
          105: ZNoEndNoAckSubpacket,
          106: ZNoEndAckSubpacket,
          107: ZEndAckSubpacket
        };
        var zdle_at = 0;
        while (zdle_at < bytes_arr.length) {
          zdle_at = bytes_arr.indexOf(Zmodem.ZMLIB.ZDLE, zdle_at);
          if (zdle_at === -1) return;
          var after_zdle = bytes_arr[zdle_at + 1];
          creator = _frame_ends_lookup[after_zdle];
          if (creator) {
            end_at = zdle_at + 1;
            break;
          }
          zdle_at++;
        }
        if (!creator) return;
        var frameend_num = bytes_arr[end_at];
        if (bytes_arr[end_at - 1] !== Zmodem.ZMLIB.ZDLE) {
          throw "Byte before frame end should be ZDLE, not " + bytes_arr[end_at - 1];
        }
        var zdle_encoded_payload = bytes_arr.splice(0, end_at - 1);
        var got_crc = Zmodem.ZDLE.splice(bytes_arr, 2, crc_len);
        if (!got_crc) {
          bytes_arr.unshift.apply(bytes_arr, zdle_encoded_payload);
          return;
        }
        var payload = Zmodem.ZDLE.decode(zdle_encoded_payload);
        Zmodem.CRC[crc_len === 2 ? "verify16" : "verify32"](
          payload.concat([frameend_num]),
          got_crc
        );
        return new creator(payload, got_crc);
      }
    };
    class ZEndSubpacketBase extends Zmodem.Subpacket {
      frame_end() {
        return true;
      }
    }
    class ZNoEndSubpacketBase extends Zmodem.Subpacket {
      frame_end() {
        return false;
      }
    }
    class ZEndNoAckSubpacket extends ZEndSubpacketBase {
      ack_expected() {
        return false;
      }
    }
    ZEndNoAckSubpacket.prototype._frameend_num = ZCRCE;
    class ZEndAckSubpacket extends ZEndSubpacketBase {
      ack_expected() {
        return true;
      }
    }
    ZEndAckSubpacket.prototype._frameend_num = ZCRCW;
    class ZNoEndNoAckSubpacket extends ZNoEndSubpacketBase {
      ack_expected() {
        return false;
      }
    }
    ZNoEndNoAckSubpacket.prototype._frameend_num = ZCRCG;
    class ZNoEndAckSubpacket extends ZNoEndSubpacketBase {
      ack_expected() {
        return true;
      }
    }
    ZNoEndAckSubpacket.prototype._frameend_num = ZCRCQ;
    SUBPACKET_BUILDER = {
      end_no_ack: ZEndNoAckSubpacket,
      end_ack: ZEndAckSubpacket,
      no_end_no_ack: ZNoEndNoAckSubpacket,
      no_end_ack: ZNoEndAckSubpacket
    };
  })(zsubpacket);
  return zsubpacket.exports;
}
var zvalidation = { exports: {} };
var hasRequiredZvalidation;
function requireZvalidation() {
  if (hasRequiredZvalidation) return zvalidation.exports;
  hasRequiredZvalidation = 1;
  (function(module) {
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireZerror()
    );
    const LOOKS_LIKE_ZMODEM_HEADER = /\*\x18[AC]|\*\*\x18B/;
    function _validate_number(key, value) {
      if (value < 0) {
        throw new Zmodem.Error("validation", "“" + key + "” (" + value + ") must be nonnegative.");
      }
      if (value !== Math.floor(value)) {
        throw new Zmodem.Error("validation", "“" + key + "” (" + value + ") must be an integer.");
      }
    }
    Zmodem.Validation = {
      /**
       * Validates and normalizes a set of parameters for an offer to send.
       * NOTE: This returns “mtime” as epoch seconds, not a Date. This is
       * inconsistent with the get_details() method in Session, but it’s
       * more useful for sending over the wire.
       *
       * @param {FileDetails} params - The file details. Some fairly trivial
       * variances from the specification are allowed.
       *
       * @return {FileDetails} The parameters that should be sent. `mtime`
       * will be a Date rather than a number.
       */
      offer_parameters: function offer_parameters(params) {
        if (!params.name) {
          throw new Zmodem.Error("validation", "Need “name”!");
        }
        if (typeof params.name !== "string") {
          throw new Zmodem.Error("validation", "“name” (" + params.name + ") must be a string!");
        }
        params = Object.assign({}, params);
        if (LOOKS_LIKE_ZMODEM_HEADER.test(params.name)) {
          console.warn("The filename " + JSON.stringify(name) + " contains characters that look like a ZMODEM header. This could corrupt the ZMODEM session; consider renaming it so that the filename doesn’t contain control characters.");
        }
        if (params.serial !== null && params.serial !== void 0) {
          throw new Zmodem.Error("validation", "“serial” is meaningless.");
        }
        params.serial = null;
        ["size", "mode", "files_remaining", "bytes_remaining"].forEach(
          function(k2) {
            var ok;
            switch (typeof params[k2]) {
              case "object":
                ok = params[k2] === null;
                break;
              case "undefined":
                params[k2] = null;
                ok = true;
                break;
              case "number":
                _validate_number(k2, params[k2]);
                ok = true;
                break;
            }
            if (!ok) {
              throw new Zmodem.Error("validation", "“" + k2 + "” (" + params[k2] + ") must be null, undefined, or a number.");
            }
          }
        );
        if (typeof params.mode === "number") {
          params.mode |= 32768;
        }
        if (params.files_remaining === 0) {
          throw new Zmodem.Error("validation", "“files_remaining”, if given, must be positive.");
        }
        var mtime_ok;
        switch (typeof params.mtime) {
          case "object":
            mtime_ok = true;
            if (params.mtime instanceof Date) {
              var date_obj = params.mtime;
              params.mtime = Math.floor(date_obj.getTime() / 1e3);
              if (params.mtime < 0) {
                throw new Zmodem.Error("validation", "“mtime” (" + date_obj + ") must not be earlier than 1970.");
              }
            } else if (params.mtime !== null) {
              mtime_ok = false;
            }
            break;
          case "undefined":
            params.mtime = null;
            mtime_ok = true;
            break;
          case "number":
            _validate_number("mtime", params.mtime);
            mtime_ok = true;
            break;
        }
        if (!mtime_ok) {
          throw new Zmodem.Error("validation", "“mtime” (" + params.mtime + ") must be null, undefined, a Date, or a number.");
        }
        return params;
      }
    };
  })(zvalidation);
  return zvalidation.exports;
}
var hasRequiredZsession;
function requireZsession() {
  if (hasRequiredZsession) return zsession.exports;
  hasRequiredZsession = 1;
  (function(module) {
    var Zmodem = module.exports;
    Zmodem.DEBUG = false;
    Object.assign(
      Zmodem,
      requireEncode(),
      requireText(),
      requireZdle(),
      requireZmlib(),
      requireZheader(),
      requireZsubpacket(),
      requireZvalidation(),
      requireZerror()
    );
    const KEEPALIVE_INTERVAL = 5e3, ZRINIT_FLAGS = [
      "CANFDX",
      //full duplex
      "CANOVIO",
      //overlap I/O
      //lsz has a buffer overflow bug that shows itself when:
      //
      //  - 16-bit CRC is used, and
      //  - lsz receives the abort sequence while sending a file
      //
      //To avoid this, we just tell lsz to use 32-bit CRC
      //even though there is otherwise no reason. This ensures that
      //unfixed lsz versions will avoid the buffer overflow.
      "CANFC32"
    ], DEFAULT_RECEIVE_INPUT_MODE = "spool_uint8array", MAX_CHUNK_LENGTH = 8192, BS = 8, OVER_AND_OUT = [79, 79], ABORT_SEQUENCE = Zmodem.ZMLIB.ABORT_SEQUENCE;
    class _Eventer {
      /**
       * Not called directly.
       */
      constructor() {
        this._on_evt = {};
        this._evt_once_index = {};
      }
      _Add_event(evt_name) {
        this._on_evt[evt_name] = [];
        this._evt_once_index[evt_name] = [];
      }
      _get_evt_queue(evt_name) {
        if (!this._on_evt[evt_name]) {
          throw "Bad event: " + evt_name;
        }
        return this._on_evt[evt_name];
      }
      /**
       * Register a callback for a given event.
       *
       * @param {string} evt_name - The name of the event.
       *
       * @param {Function} todo - The function to execute when the event happens.
       */
      on(evt_name, todo) {
        var queue = this._get_evt_queue(evt_name);
        queue.push(todo);
        return this;
      }
      /**
       * Unregister a callback for a given event.
       *
       * @param {string} evt_name - The name of the event.
       *
       * @param {Function} [todo] - The function to execute when the event
       *  happens. If not given, the last event registered for the event
       *  is unregistered.
       */
      off(evt_name, todo) {
        var queue = this._get_evt_queue(evt_name);
        if (todo) {
          var at2 = queue.indexOf(todo);
          if (at2 === -1) {
            throw "“" + todo + "” is not in the “" + evt_name + "” queue.";
          }
          queue.splice(at2, 1);
        } else {
          queue.pop();
        }
        return this;
      }
      _Happen(evt_name) {
        var queue = this._get_evt_queue(evt_name);
        var args = Array.apply(null, arguments);
        args.shift();
        var sess = this;
        queue.forEach(function(cb) {
          cb.apply(sess, args);
        });
        return queue.length;
      }
    }
    Zmodem.Session = class ZmodemSession extends _Eventer {
      /**
       * Parse out a hex header from the given array.
       * If there’s a ZRQINIT or ZRINIT at the beginning,
       * we’ll return it. If the input isn’t a header,
       * for whatever reason, we return undefined.
       *
       * @param {number[]} octets - The bytes to parse.
       *
       * @return {Session|undefined} A Session object if the beginning
       *      of a session was parsable in “octets”; otherwise undefined.
       */
      static parse(octets) {
        var hdr;
        try {
          hdr = Zmodem.Header.parse_hex(octets);
        } catch (e2) {
          return;
        }
        if (!hdr) return;
        switch (hdr.NAME) {
          case "ZRQINIT":
            return new Zmodem.Session.Receive();
          case "ZRINIT":
            return new Zmodem.Session.Send(hdr);
        }
      }
      /**
       * Sets the sender function that a Session object will use.
       *
       * @param {Function} sender_func - The function to call.
       *      It will receive an Array with the relevant octets.
       *
       * @return {Session} The session object (for chaining).
       */
      set_sender(sender_func) {
        this._sender = sender_func;
        return this;
      }
      /**
       * Whether the current Session has ended.
       *
       * @returns {boolean} The ended state.
       */
      has_ended() {
        return this._has_ended();
      }
      /**
       * Consumes an array of octets as ZMODEM session input.
       *
       * @param {number[]} octets - The input octets.
       */
      consume(octets) {
        this._before_consume(octets);
        if (this._aborted) throw new Zmodem.Error("already_aborted");
        if (!octets.length) return;
        this._strip_and_enqueue_input(octets);
        if (!this._check_for_abort_sequence(octets)) {
          this._consume_first();
        }
        return;
      }
      /**
       * Whether the current Session has been `abort()`ed.
       *
       * @returns {boolean} The aborted state.
       */
      aborted() {
        return !!this._aborted;
      }
      /**
       * Not called directly.
       */
      constructor() {
        super();
        this._config = {};
        this._input_buffer = [];
        this._Add_event("receive");
        this._Add_event("garbage");
        this._Add_event("session_end");
      }
      /**
       * Returns the Session object’s role.
       *
       * @returns {string} One of:
       * - `receive`
       * - `send`
       */
      get_role() {
        return this.type;
      }
      _trim_leading_garbage_until_header() {
        var garbage = Zmodem.Header.trim_leading_garbage(this._input_buffer);
        if (garbage.length) {
          if (this._Happen("garbage", garbage) === 0) {
            console.debug(
              "Garbage: ",
              String.fromCharCode.apply(String, garbage),
              garbage
            );
          }
        }
      }
      _parse_and_consume_header() {
        this._trim_leading_garbage_until_header();
        var new_header_and_crc = Zmodem.Header.parse(this._input_buffer);
        if (!new_header_and_crc) return;
        if (Zmodem.DEBUG) {
          this._log_header("RECEIVED HEADER", new_header_and_crc[0]);
        }
        this._consume_header(new_header_and_crc[0]);
        this._last_header_name = new_header_and_crc[0].NAME;
        this._last_header_crc = new_header_and_crc[1];
        return new_header_and_crc[0];
      }
      _log_header(label, header) {
        console.debug(this.type, label, header.NAME, header._bytes4.join());
      }
      _consume_header(new_header) {
        this._on_receive(new_header);
        var handler = this._next_header_handler && this._next_header_handler[new_header.NAME];
        if (!handler) {
          console.error("Unhandled header!", new_header, this._next_header_handler);
          throw new Zmodem.Error("Unhandled header: " + new_header.NAME);
        }
        this._next_header_handler = null;
        handler.call(this, new_header);
      }
      //TODO: strip out the abort sequence
      _check_for_abort_sequence() {
        var abort_at = Zmodem.ZMLIB.find_subarray(this._input_buffer, ABORT_SEQUENCE);
        if (abort_at !== -1) {
          this._input_buffer.splice(0, abort_at + ABORT_SEQUENCE.length);
          this._aborted = true;
          this._on_session_end();
          throw new Zmodem.Error("peer_aborted");
        }
      }
      _send_header(name2) {
        if (!this._sender) throw "Need sender!";
        var args = Array.apply(null, arguments);
        var bytes_hdr = this._create_header_bytes(args);
        if (Zmodem.DEBUG) {
          this._log_header("SENDING HEADER", bytes_hdr[1]);
        }
        this._sender(bytes_hdr[0]);
        this._last_sent_header = bytes_hdr[1];
      }
      _create_header_bytes(name_and_args) {
        var hdr = Zmodem.Header.build.apply(Zmodem.Header, name_and_args);
        var formatter = this._get_header_formatter(name_and_args[0]);
        return [
          hdr[formatter](this._zencoder),
          hdr
        ];
      }
      _strip_and_enqueue_input(input) {
        Zmodem.ZMLIB.strip_ignored_bytes(input);
        this._input_buffer.push.apply(this._input_buffer, input);
      }
      /**
       * **STOP!** You probably want to `skip()` an Offer rather than
       * `abort()`. See below.
       *
       * Abort the current session by sending the ZMODEM abort sequence.
       * This function will cause the Session object to refuse to send
       * any further data.
       *
       * Zmodem.Sentry is configured to send all output to the terminal
       * after a session’s `abort()`. That could result in lots of
       * ZMODEM garble being sent to the JavaScript terminal, which you
       * probably don’t want.
       *
       * `skip()` on an Offer is better because Session will continue to
       * discard data until we reach either another file or the
       * sender-initiated end of the ZMODEM session. So no ZMODEM garble,
       * and the session will end successfully.
       *
       * The behavior of `abort()` is subject to change since it’s not
       * very useful as currently implemented.
       */
      abort() {
        this._sender(
          ABORT_SEQUENCE.concat([BS, BS, BS, BS, BS])
        );
        this._aborted = true;
        this._sender = function() {
          throw new Zmodem.Error("already_aborted");
        };
        this._on_session_end();
        return;
      }
      //----------------------------------------------------------------------
      _on_session_end() {
        this._Happen("session_end");
      }
      _on_receive(hdr_or_pkt) {
        this._Happen("receive", hdr_or_pkt);
      }
      _before_consume() {
      }
    };
    function _trim_OO(array) {
      if (0 === Zmodem.ZMLIB.find_subarray(array, OVER_AND_OUT)) {
        array.splice(0, OVER_AND_OUT.length);
      } else if (array[0] === OVER_AND_OUT[OVER_AND_OUT.length - 1]) {
        array.splice(0, 1);
      }
      return array;
    }
    Zmodem.Session.Receive = class ZmodemReceiveSession extends Zmodem.Session {
      //We only get 1 file at a time, so on each consume() either
      //continue state for the current file or start a new one.
      /**
       * Not called directly.
       */
      constructor() {
        super();
        this._Add_event("offer");
        this._Add_event("data_in");
        this._Add_event("file_end");
      }
      /**
       * Consume input bytes from the sender.
       *
       * @private
       * @param {number[]} octets - The bytes to consume.
       */
      _before_consume(octets) {
        if (this._bytes_after_OO) {
          throw "PROTOCOL: Session is completed!";
        }
        this._bytes_being_consumed = octets;
      }
      /**
       * Return any bytes that have been `consume()`d but
       * came after the end of the ZMODEM session.
       *
       * @returns {number[]} The trailing bytes.
       */
      get_trailing_bytes() {
        if (this._aborted) return [];
        if (!this._bytes_after_OO) {
          throw "PROTOCOL: Session is not completed!";
        }
        return this._bytes_after_OO.slice(0);
      }
      _has_ended() {
        return this.aborted() || !!this._bytes_after_OO;
      }
      //Receiver always sends hex headers.
      _get_header_formatter() {
        return "to_hex";
      }
      _parse_and_consume_subpacket() {
        var parse_func;
        if (this._last_header_crc === 16) {
          parse_func = "parse16";
        } else {
          parse_func = "parse32";
        }
        var subpacket = Zmodem.Subpacket[parse_func](this._input_buffer);
        if (subpacket) {
          if (Zmodem.DEBUG) {
            console.debug(this.type, "RECEIVED SUBPACKET", subpacket);
          }
          this._consume_data(subpacket);
          if (subpacket.frame_end()) {
            this._next_subpacket_handler = null;
          }
        }
        return subpacket;
      }
      _consume_first() {
        if (this._got_ZFIN) {
          if (this._input_buffer.length < 2) return;
          if (Zmodem.ZMLIB.find_subarray(this._input_buffer, OVER_AND_OUT) !== 0) {
            console.warn("PROTOCOL: Only thing after ZFIN should be “OO” (79,79), not: " + this._input_buffer.join());
          }
          this._bytes_after_OO = _trim_OO(this._bytes_being_consumed.slice(0));
          this._on_session_end();
          return;
        }
        var parsed;
        do {
          if (this._next_subpacket_handler) {
            parsed = this._parse_and_consume_subpacket();
          } else {
            parsed = this._parse_and_consume_header();
          }
        } while (parsed && this._input_buffer.length);
      }
      _consume_data(subpacket) {
        this._on_receive(subpacket);
        if (!this._next_subpacket_handler) {
          throw "PROTOCOL: Received unexpected data packet after " + this._last_header_name + " header: " + subpacket.get_payload().join();
        }
        this._next_subpacket_handler.call(this, subpacket);
      }
      _octets_to_string(octets) {
        if (!this._textdecoder) {
          this._textdecoder = new Zmodem.Text.Decoder();
        }
        return this._textdecoder.decode(new Uint8Array(octets));
      }
      _consume_ZFILE_data(hdr, subpacket) {
        if (this._file_info) {
          throw "PROTOCOL: second ZFILE data subpacket received";
        }
        var packet_payload = subpacket.get_payload();
        var nul_at = packet_payload.indexOf(0);
        var fname = this._octets_to_string(packet_payload.slice(0, nul_at));
        var the_rest = this._octets_to_string(packet_payload.slice(1 + nul_at)).split(" ");
        var mtime = the_rest[1] && parseInt(the_rest[1], 8) || void 0;
        if (mtime) {
          mtime = new Date(mtime * 1e3);
        }
        this._file_info = {
          name: fname,
          size: the_rest[0] ? parseInt(the_rest[0], 10) : null,
          mtime: mtime || null,
          mode: the_rest[2] && parseInt(the_rest[2], 8) || null,
          serial: the_rest[3] && parseInt(the_rest[3], 10) || null,
          files_remaining: the_rest[4] ? parseInt(the_rest[4], 10) : null,
          bytes_remaining: the_rest[5] ? parseInt(the_rest[5], 10) : null
        };
        var xfer = new Offer(
          hdr.get_options(),
          this._file_info,
          this._accept.bind(this),
          this._skip.bind(this)
        );
        this._current_transfer = xfer;
      }
      _consume_ZDATA_data(subpacket) {
        if (!this._accepted_offer) {
          throw "PROTOCOL: Received data without accepting!";
        }
        if (!this._offset_ok) {
          console.warn("offset not ok!");
          _send_ZRPOS();
          return;
        }
        this._file_offset += subpacket.get_payload().length;
        this._on_data_in(subpacket);
        if (subpacket.ack_expected() && !subpacket.frame_end()) {
          this._send_header("ZACK", Zmodem.ENCODELIB.pack_u32_le(this._file_offset));
        }
      }
      _make_promise_for_between_files() {
        var sess = this;
        return new Promise(function(res) {
          var between_files_handler = {
            ZFILE: function(hdr) {
              this._next_subpacket_handler = function(subpacket) {
                this._next_subpacket_handler = null;
                this._consume_ZFILE_data(hdr, subpacket);
                this._Happen("offer", this._current_transfer);
                res(this._current_transfer);
              };
            },
            //We use this as a keep-alive. Maybe other
            //implementations do, too?
            ZSINIT: function(hdr) {
              sess._next_subpacket_handler = function(spkt) {
                sess._next_subpacket_handler = null;
                sess._consume_ZSINIT_data(spkt);
                sess._send_header("ZACK");
                sess._next_header_handler = between_files_handler;
              };
            },
            ZFIN: function() {
              this._consume_ZFIN();
              res();
            }
          };
          sess._next_header_handler = between_files_handler;
        });
      }
      _consume_ZSINIT_data(spkt) {
        this._attn = spkt.get_payload();
      }
      /**
       * Start the ZMODEM session by signaling to the sender that
       * we are ready for the first file offer.
       *
       * @returns {Promise} A promise that resolves with an Offer object
       * or, if the sender closes the session immediately without offering
       * anything, nothing.
       */
      start() {
        if (this._started) throw "Already started!";
        this._started = true;
        var ret = this._make_promise_for_between_files();
        this._send_ZRINIT();
        return ret;
      }
      //Returns a promise that’s fulfilled when the file
      //transfer is done.
      //
      //  That ZEOF promise return is another promise that’s
      //  fulfilled when we get either ZFIN or another ZFILE.
      _accept(offset) {
        this._accepted_offer = true;
        this._file_offset = offset || 0;
        var sess = this;
        var ret = new Promise(function(resolve_accept) {
          sess._next_header_handler = {
            ZDATA: function on_ZDATA(hdr) {
              this._consume_ZDATA(hdr);
              this._next_subpacket_handler = this._consume_ZDATA_data;
              this._next_header_handler = {
                ZEOF: function on_ZEOF(hdr2) {
                  this._consume_ZEOF(hdr2);
                  this._next_subpacket_handler = null;
                  this._make_promise_for_between_files();
                  resolve_accept();
                  this._send_ZRINIT();
                }
              };
            }
          };
        });
        this._send_ZRPOS();
        return ret;
      }
      _skip() {
        var ret = this._make_promise_for_between_files();
        if (this._accepted_offer) {
          if (!this._current_transfer) return;
          var bound_make_promise_for_between_files = (function() {
            this._accepted_offer = false;
            this._next_subpacket_handler = null;
            this._make_promise_for_between_files();
          }).bind(this);
          Object.assign(
            this._next_header_handler,
            {
              ZEOF: bound_make_promise_for_between_files,
              ZDATA: (function() {
                bound_make_promise_for_between_files();
                this._next_header_handler.ZEOF = bound_make_promise_for_between_files;
              }).bind(this)
            }
          );
        }
        this._file_info = null;
        this._send_header("ZSKIP");
        return ret;
      }
      _send_ZRINIT() {
        this._send_header("ZRINIT", ZRINIT_FLAGS);
      }
      _consume_ZFIN() {
        this._got_ZFIN = true;
        this._send_header("ZFIN");
      }
      _consume_ZEOF(header) {
        if (this._file_offset !== header.get_offset()) {
          throw "ZEOF offset mismatch; unimplemented (local: " + this._file_offset + "; ZEOF: " + header.get_offset() + ")";
        }
        this._on_file_end();
        this._file_info = null;
        this._current_transfer = null;
      }
      _consume_ZDATA(header) {
        if (this._file_offset === header.get_offset()) {
          this._offset_ok = true;
        } else {
          throw "Error correction is unimplemented.";
        }
      }
      _send_ZRPOS() {
        this._send_header("ZRPOS", this._file_offset);
      }
      //----------------------------------------------------------------------
      //events
      _on_file_end() {
        this._Happen("file_end");
        if (this._current_transfer) {
          this._current_transfer._Happen("complete");
          this._current_transfer = null;
        }
      }
      _on_data_in(subpacket) {
        this._Happen("data_in", subpacket);
        if (this._current_transfer) {
          this._current_transfer._Happen("input", subpacket.get_payload());
        }
      }
    };
    Object.assign(
      Zmodem.Session.Receive.prototype,
      {
        type: "receive"
      }
    );
    var Transfer_Offer_Mixin = {
      /**
       * Returns the file details object.
       * @returns {FileDetails} `mtime` is a Date.
       */
      get_details: function get_details() {
        return Object.assign({}, this._file_info);
      },
      /**
       * Returns a parse of the ZFILE header’s payload.
       *
       * @returns {Object} Members are:
       *
       * - `conversion` (string | undefined)
       * - `management` (string | undefined)
       * - `transfer` (string | undefined)
       * - `sparse` (boolean)
       */
      get_options: function get_options() {
        return Object.assign({}, this._zfile_opts);
      },
      /**
       * Returns the offset based on the last transferred chunk.
       * @returns {number} The file offset (i.e., number of bytes after
       *  the start of the file).
       */
      get_offset: function get_offset() {
        return this._file_offset;
      }
    };
    class Transfer {
      /**
       * Not called directly.
       */
      constructor(file_info, offset, send_func, end_func) {
        this._file_info = file_info;
        this._file_offset = offset || 0;
        this._send = send_func;
        this._end = end_func;
      }
      /**
       * Send a (non-terminal) piece of the file.
       *
       * @param { number[] | Uint8Array } array_like - The bytes to send.
       */
      send(array_like) {
        this._send(array_like);
        this._file_offset += array_like.length;
      }
      /**
       * Complete the file transfer.
       *
       * @param { number[] | Uint8Array } [array_like] - The last bytes to send.
       *
       * @return { Promise } Resolves when the receiver has indicated
       *      acceptance of the end of the file transfer.
       */
      end(array_like) {
        var ret = this._end(array_like || []);
        if (array_like) this._file_offset += array_like.length;
        return ret;
      }
    }
    Object.assign(Transfer.prototype, Transfer_Offer_Mixin);
    class Offer extends _Eventer {
      /**
       * Not called directly.
       */
      constructor(zfile_opts, file_info, accept_func, skip_func) {
        super();
        this._zfile_opts = zfile_opts;
        this._file_info = file_info;
        this._accept_func = accept_func;
        this._skip_func = skip_func;
        this._Add_event("input");
        this._Add_event("complete");
        this.on("input", this._input_handler);
      }
      _verify_not_skipped() {
        if (this._skipped) {
          throw new Zmodem.Error("Already skipped!");
        }
      }
      /**
       * Tell the sender that you don’t want the offered file.
       *
       * You can send this in lieu of `accept()` or after it, e.g.,
       * if you find that the transfer is taking too long. Note that,
       * if you `skip()` after you `accept()`, you’ll likely have to
       * wait for buffers to clear out.
       *
       */
      skip() {
        this._verify_not_skipped();
        this._skipped = true;
        return this._skip_func.apply(this, arguments);
      }
      /**
       * Tell the sender to send the offered file.
       *
       * @param {Object} [opts] - Can be:
       * @param {string} [opts.oninput=spool_uint8array] - Can be:
       *
       * - `spool_uint8array`: Stores the ZMODEM
       *     packet payloads as Uint8Array instances.
       *     This makes for an easy transition to a Blob,
       *     which JavaScript can use to save the file to disk.
       *
       * - `spool_array`: Stores the ZMODEM packet payloads
       *     as Array instances. Each value is an octet value.
       *
       * - (function): A handler that receives each payload
       *     as it arrives. The Offer object does not store
       *     the payloads internally when thus configured.
       *
       * @return { Promise } Resolves when the file is fully received.
       *      If the Offer has been spooling
       *      the packet payloads, the promise resolves with an Array
       *      that contains those payloads.
       */
      accept(opts) {
        this._verify_not_skipped();
        if (this._accepted) {
          throw new Zmodem.Error("Already accepted!");
        }
        this._accepted = true;
        if (!opts) opts = {};
        this._file_offset = opts.offset || 0;
        switch (opts.on_input) {
          case null:
          case void 0:
          case "spool_array":
          case DEFAULT_RECEIVE_INPUT_MODE:
            this._spool = [];
            break;
          default:
            if (typeof opts.on_input !== "function") {
              throw "Invalid “on_input”: " + opts.on_input;
            }
        }
        this._input_handler_mode = opts.on_input || DEFAULT_RECEIVE_INPUT_MODE;
        return this._accept_func(this._file_offset).then(this._get_spool.bind(this));
      }
      _input_handler(payload) {
        this._file_offset += payload.length;
        if (typeof this._input_handler_mode === "function") {
          this._input_handler_mode(payload);
        } else {
          if (this._input_handler_mode === DEFAULT_RECEIVE_INPUT_MODE) {
            payload = new Uint8Array(payload);
          } else if (this._input_handler_mode !== "spool_array") {
            throw new Zmodem.Error("WTF?? _input_handler_mode = " + this._input_handler_mode);
          }
          this._spool.push(payload);
        }
      }
      _get_spool() {
        return this._spool;
      }
    }
    Object.assign(Offer.prototype, Transfer_Offer_Mixin);
    const SENDER_BINARY_HEADER = {
      ZFILE: true,
      ZDATA: true
    };
    Zmodem.Session.Send = class ZmodemSendSession extends Zmodem.Session {
      /**
       * Not called directly.
       */
      constructor(zrinit_hdr) {
        super();
        if (!zrinit_hdr) {
          throw "Need first header!";
        } else if (zrinit_hdr.NAME !== "ZRINIT") {
          throw "First header should be ZRINIT, not " + zrinit_hdr.NAME;
        }
        this._last_header_name = "ZRINIT";
        this._subpacket_encode_func = "encode16";
        this._zencoder = new Zmodem.ZDLE();
        this._consume_ZRINIT(zrinit_hdr);
        this._file_offset = 0;
        this._start_keepalive_on_set_sender = true;
      }
      /**
       * Sets the sender function. The first time this is called,
       * it will also initiate a keepalive using ZSINIT until the
       * first file is sent.
       *
       * @param {Function} func - The function to call.
       *  It will receive an Array with the relevant octets.
       *
       * @return {Session} The session object (for chaining).
       */
      set_sender(func) {
        super.set_sender(func);
        if (this._start_keepalive_on_set_sender) {
          this._start_keepalive_on_set_sender = false;
          this._start_keepalive();
        }
        return this;
      }
      //7.3.3 .. The sender also uses hex headers when they are
      //not followed by binary data subpackets.
      //
      //FG: … or when the header is ZSINIT? That’s what lrzsz does, anyway.
      //Then it sends a single NUL byte as the payload to an end_ack subpacket.
      _get_header_formatter(name2) {
        return SENDER_BINARY_HEADER[name2] ? "to_binary16" : "to_hex";
      }
      //In order to keep lrzsz from timing out, we send ZSINIT every 5 seconds.
      //Maybe make this configurable?
      _start_keepalive() {
        if (!this._keepalive_promise) {
          var sess = this;
          this._keepalive_promise = new Promise(function(resolve) {
            sess._keepalive_timeout = setTimeout(resolve, KEEPALIVE_INTERVAL);
          }).then(function() {
            sess._next_header_handler = {
              ZACK: function() {
                sess._got_ZSINIT_ZACK = true;
              }
            };
            sess._send_ZSINIT();
            sess._keepalive_promise = null;
            sess._start_keepalive();
          });
        }
      }
      _stop_keepalive() {
        if (this._keepalive_promise) {
          clearTimeout(this._keepalive_timeout);
          this._keep_alive_promise = null;
        }
      }
      _send_ZSINIT() {
        var zsinit_flags = [];
        if (this._zencoder.escapes_ctrl_chars()) {
          zsinit_flags.push("ESCCTL");
        }
        this._send_header_and_data(
          ["ZSINIT", zsinit_flags],
          [0],
          "end_ack"
        );
      }
      _consume_ZRINIT(hdr) {
        this._last_ZRINIT = hdr;
        if (hdr.get_buffer_size()) {
          throw "Buffer size (" + hdr.get_buffer_size() + ") is unsupported!";
        }
        if (!hdr.can_full_duplex()) {
          throw "Half-duplex I/O is unsupported!";
        }
        if (!hdr.can_overlap_io()) {
          throw "Non-overlap I/O is unsupported!";
        }
        if (hdr.escape_8th_bit()) {
          throw "8-bit escaping is unsupported!";
        }
        {
          this._zencoder.set_escape_ctrl_chars(true);
          if (!hdr.escape_ctrl_chars()) {
            console.debug("Peer didn’t request escape of all control characters. Will send ZSINIT to force recognition of escaped control characters.");
          }
        }
      }
      //https://stackoverflow.com/questions/23155939/missing-0xf-and-0x16-when-binary-data-through-virtual-serial-port-pair-created-b
      //^^ Because of that, we always escape control characters.
      //The alternative would be that lrz would never receive those
      //two bytes from zmodem.js.
      _ensure_receiver_escapes_ctrl_chars() {
        var promise;
        var needs_ZSINIT = !this._last_ZRINIT.escape_ctrl_chars() && !this._got_ZSINIT_ZACK;
        if (needs_ZSINIT) {
          var sess = this;
          promise = new Promise(function(res) {
            sess._next_header_handler = {
              ZACK: (hdr) => {
                res();
              }
            };
            sess._send_ZSINIT();
          });
        } else {
          promise = Promise.resolve();
        }
        return promise;
      }
      _convert_params_to_offer_payload_array(params) {
        params = Zmodem.Validation.offer_parameters(params);
        var subpacket_payload = params.name + "\0";
        var subpacket_space_pieces = [
          (params.size || 0).toString(10),
          params.mtime ? params.mtime.toString(8) : "0",
          params.mode ? (32768 | params.mode).toString(8) : "0",
          "0"
          //serial
        ];
        if (params.files_remaining) {
          subpacket_space_pieces.push(params.files_remaining);
          if (params.bytes_remaining) {
            subpacket_space_pieces.push(params.bytes_remaining);
          }
        }
        subpacket_payload += subpacket_space_pieces.join(" ");
        return this._string_to_octets(subpacket_payload);
      }
      /**
       * Send an offer to the receiver.
       *
       * @param {FileDetails} params - All about the file you want to transfer.
       *
       * @returns {Promise} If the receiver accepts the offer, then the
       * resolution is a Transfer object; otherwise the resolution is
       * undefined.
       */
      send_offer(params) {
        if (Zmodem.DEBUG) {
          console.debug("SENDING OFFER", params);
        }
        if (!params) throw "need file params!";
        if (this._sending_file) throw "Already sending file!";
        var payload_array = this._convert_params_to_offer_payload_array(params);
        this._stop_keepalive();
        var sess = this;
        function zrpos_handler_setter_func() {
          sess._next_header_handler = {
            // The receiver may send ZRPOS in at least two cases:
            //
            // 1) A malformed subpacket arrived, so we need to
            // “rewind” a bit and continue from the receiver’s
            // last-successful location in the file.
            //
            // 2) The receiver hasn’t gotten any data for a bit,
            // so it sends ZRPOS as a “ping”.
            //
            // Case #1 shouldn’t happen since zmodem.js requires a
            // reliable transport. Case #2, though, can happen due
            // to either normal network congestion or errors in
            // implementation. In either case, there’s nothing for
            // us to do but to ignore the ZRPOS, with an optional
            // warning.
            //
            ZRPOS: function(hdr) {
              if (Zmodem.DEBUG) {
                console.warn("Mid-transfer ZRPOS … implementation error?");
              }
              zrpos_handler_setter_func();
            }
          };
        }
        var doer_func = function() {
          var handler_setter_promise = new Promise(function(res) {
            sess._next_header_handler = {
              ZSKIP: function() {
                sess._start_keepalive();
                res();
              },
              ZRPOS: function(hdr) {
                sess._sending_file = true;
                zrpos_handler_setter_func();
                res(
                  new Transfer(
                    params,
                    hdr.get_offset(),
                    sess._send_interim_file_piece.bind(sess),
                    sess._end_file.bind(sess)
                  )
                );
              }
            };
          });
          sess._send_header_and_data(["ZFILE"], payload_array, "end_ack");
          delete sess._sent_ZDATA;
          return handler_setter_promise;
        };
        {
          return this._ensure_receiver_escapes_ctrl_chars().then(doer_func);
        }
      }
      _send_header_and_data(hdr_name_and_args, data_arr, frameend) {
        var bytes_hdr = this._create_header_bytes(hdr_name_and_args);
        var data_bytes = this._build_subpacket_bytes(data_arr, frameend);
        bytes_hdr[0].push.apply(bytes_hdr[0], data_bytes);
        if (Zmodem.DEBUG) {
          this._log_header("SENDING HEADER", bytes_hdr[1]);
          console.debug(this.type, "-- HEADER PAYLOAD:", frameend, data_bytes.length);
        }
        this._sender(bytes_hdr[0]);
        this._last_sent_header = bytes_hdr[1];
      }
      _build_subpacket_bytes(bytes_arr, frameend) {
        var subpacket = Zmodem.Subpacket.build(bytes_arr, frameend);
        return subpacket[this._subpacket_encode_func](this._zencoder);
      }
      _build_and_send_subpacket(bytes_arr, frameend) {
        this._sender(this._build_subpacket_bytes(bytes_arr, frameend));
      }
      _string_to_octets(string) {
        if (!this._textencoder) {
          this._textencoder = new Zmodem.Text.Encoder();
        }
        var uint8arr = this._textencoder.encode(string);
        return Array.prototype.slice.call(uint8arr);
      }
      /*
      Potential future support for responding to ZRPOS:
      send_file_offset(offset) {
      }
      */
      /*
          Sending logic works thus:
              - ASSUME the receiver can overlap I/O (CANOVIO)
                  (so fail if !CANFDX || !CANOVIO)
              - Sender opens the firehose … all ZCRCG (!end/!ack)
                  until the end, when we send a ZCRCE (end/!ack)
                  NB: try 8k/32k/64k chunk sizes? Looks like there’s
                  no need to change the packet otherwise.
      */
      //TODO: Put this on a Transfer object similar to what Receive uses?
      _send_interim_file_piece(bytes_obj) {
        this._send_file_part(bytes_obj, "no_end_no_ack");
        return Promise.resolve();
      }
      _ensure_we_are_sending() {
        if (!this._sending_file) throw "Not sending a file currently!";
      }
      //This resolves once we receive ZEOF.
      _end_file(bytes_obj) {
        this._ensure_we_are_sending();
        this._send_file_part(bytes_obj, "end_no_ack");
        var sess = this;
        var ret = new Promise(function(res) {
          sess._sending_file = false;
          sess._prepare_to_receive_ZRINIT(res);
        });
        this._send_header("ZEOF", this._file_offset);
        this._file_offset = 0;
        return ret;
      }
      //Called at the beginning of our session
      //and also when we’re done sending a file.
      _prepare_to_receive_ZRINIT(after_consume) {
        this._next_header_handler = {
          ZRINIT: function(hdr) {
            this._consume_ZRINIT(hdr);
            if (after_consume) after_consume();
          }
        };
      }
      /**
       * Signal to the receiver that the ZMODEM session is wrapping up.
       *
       * @returns {Promise} Resolves when the receiver has responded to
       * our signal that the session is over.
       */
      close() {
        var ok_to_close = this._last_header_name === "ZRINIT";
        if (!ok_to_close) {
          ok_to_close = this._last_header_name === "ZSKIP";
        }
        if (!ok_to_close) {
          ok_to_close = this._last_sent_header.name === "ZSINIT" && this._last_header_name === "ZACK";
        }
        if (!ok_to_close) {
          throw "Can’t close; last received header was “" + this._last_header_name + "”";
        }
        var sess = this;
        var ret = new Promise(function(res, rej) {
          sess._next_header_handler = {
            ZFIN: function() {
              sess._sender(OVER_AND_OUT);
              sess._sent_OO = true;
              sess._on_session_end();
              res();
            }
          };
        });
        this._send_header("ZFIN");
        return ret;
      }
      _has_ended() {
        return this.aborted() || !!this._sent_OO;
      }
      _send_file_part(bytes_obj, final_packetend) {
        if (!this._sent_ZDATA) {
          this._send_header("ZDATA", this._file_offset);
          this._sent_ZDATA = true;
        }
        var obj_offset = 0;
        var bytes_count = bytes_obj.length;
        while (true) {
          var chunk_size = Math.min(obj_offset + MAX_CHUNK_LENGTH, bytes_count) - obj_offset;
          var at_end = chunk_size + obj_offset >= bytes_count;
          var chunk = bytes_obj.slice(obj_offset, obj_offset + chunk_size);
          if (!(chunk instanceof Array)) {
            chunk = Array.prototype.slice.call(chunk);
          }
          this._build_and_send_subpacket(
            chunk,
            at_end ? final_packetend : "no_end_no_ack"
          );
          this._file_offset += chunk_size;
          obj_offset += chunk_size;
          if (obj_offset >= bytes_count) break;
        }
      }
      _consume_first() {
        if (!this._parse_and_consume_header()) {
          if (this._input_buffer.join() === "67") {
            throw "Receiver has fallen back to YMODEM.";
          }
        }
      }
      _on_session_end() {
        this._stop_keepalive();
        super._on_session_end();
      }
    };
    Object.assign(
      Zmodem.Session.Send.prototype,
      {
        type: "send"
      }
    );
  })(zsession);
  return zsession.exports;
}
var hasRequiredZsentry;
function requireZsentry() {
  if (hasRequiredZsentry) return zsentry.exports;
  hasRequiredZsentry = 1;
  (function(module) {
    var Zmodem = module.exports;
    Object.assign(
      Zmodem,
      requireZmlib(),
      requireZsession()
    );
    const MAX_ZM_HEX_START_LENGTH = 21, COMMON_ZM_HEX_START = [42, 42, 24, 66, 48], SENTRY_CONSTRUCTOR_REQUIRED_ARGS = [
      "to_terminal",
      "on_detect",
      "on_retract",
      "sender"
    ];
    class Detection {
      /**
       * Not called directly.
       */
      constructor(session_type, accepter, denier, checker) {
        this._confirmer = accepter;
        this._denier = denier;
        this._is_valid = checker;
        this._session_type = session_type;
      }
      /**
       * Confirm that the detected ZMODEM sequence indicates the
       * start of a ZMODEM session.
       *
       * @return {Session} The ZMODEM Session object (i.e., either a
       *  Send or Receive instance).
       */
      confirm() {
        return this._confirmer.apply(this, arguments);
      }
      /**
       * Tell the Sentry that the detected bytes sequence is
       * **NOT** intended to be the start of a ZMODEM session.
       */
      deny() {
        return this._denier.apply(this, arguments);
      }
      /**
       * Tells whether the Detection is still valid; i.e., whether
       * the Sentry has `consume()`d bytes that invalidate the
       * Detection.
       *
       * @returns {boolean} Whether the Detection is valid.
       */
      is_valid() {
        return this._is_valid.apply(this, arguments);
      }
      /**
       * Gives the session’s role.
       *
       * @returns {string} One of:
       * - `receive`
       * - `send`
       */
      get_session_role() {
        return this._session_type;
      }
    }
    Zmodem.Sentry = class ZmodemSentry {
      /**
       * Invoked directly. Creates a new Sentry that inspects all
       * traffic before it goes to the terminal.
       *
       * @param {Object} options - The Sentry parameters
       *
       * @param {Function} options.to_terminal - Handler that sends
       * traffic to the terminal object. Receives an iterable object
       * (e.g., an Array) that contains octet numbers.
       *
       * @param {Function} options.on_detect - Handler for new
       * detection events. Receives a new Detection object.
       *
       * @param {Function} options.on_retract - Handler for retraction
       * events. Receives no input.
       *
       * @param {Function} options.sender - Handler that sends traffic to
       * the peer. If, for example, your application uses WebSocket to talk
       * to the peer, use this to send data to the WebSocket instance.
       */
      constructor(options) {
        if (!options) throw "Need options!";
        var sentry = this;
        SENTRY_CONSTRUCTOR_REQUIRED_ARGS.forEach(function(arg) {
          if (!options[arg]) {
            throw "Need “" + arg + "”!";
          }
          sentry["_" + arg] = options[arg];
        });
        this._cache = [];
      }
      _after_session_end() {
        this._zsession = null;
      }
      /**
       * “Consumes” a piece of input:
       *
       *  - If there is no active or pending ZMODEM session, the text is
       *      all output. (This is regardless of whether we’ve got a new
       *      Detection.)
       *
       *  - If there is no active ZMODEM session and the input **ends** with
       *      a ZRINIT or ZRQINIT, then a new Detection object is created,
       *      and it is passed to the “on_detect” function.
       *      If there was another pending Detection object, it is retracted.
       *
       *  - If there is no active ZMODEM session and the input does NOT end
       *      with a ZRINIT or ZRQINIT, then any pending Detection object is
       *      retracted.
       *
       *  - If there is an active ZMODEM session, the input is passed to it.
       *      Any non-ZMODEM data (i.e., “garbage”) parsed from the input
       *      is sent to output.
       *      If the ZMODEM session ends, any post-ZMODEM part of the input
       *      is sent to output.
       *
       *  @param {number[] | ArrayBuffer} input - Octets to parse as input.
       */
      consume(input) {
        if (!(input instanceof Array)) {
          input = Array.prototype.slice.call(new Uint8Array(input));
        }
        if (this._zsession) {
          var session_before_consume = this._zsession;
          session_before_consume.consume(input);
          if (session_before_consume.has_ended()) {
            if (session_before_consume.type === "receive") {
              input = session_before_consume.get_trailing_bytes();
            } else {
              input = [];
            }
          } else return;
        }
        var new_session = this._parse(input);
        var to_terminal = input;
        if (new_session) {
          let checker = function() {
            return sentry._parsed_session === new_session;
          }, accepter = function() {
            if (!this.is_valid()) {
              throw "Stale ZMODEM session!";
            }
            new_session.on("garbage", sentry._to_terminal);
            new_session.on(
              "session_end",
              sentry._after_session_end.bind(sentry)
            );
            new_session.set_sender(sentry._sender);
            delete sentry._parsed_session;
            return sentry._zsession = new_session;
          };
          let replacement_detect = !!this._parsed_session;
          if (replacement_detect) {
            if (this._parsed_session.type === new_session.type) {
              to_terminal = [];
            }
            this._on_retract();
          }
          this._parsed_session = new_session;
          var sentry = this;
          this._on_detect(new Detection(
            new_session.type,
            accepter,
            this._send_abort.bind(this),
            checker
          ));
        } else {
          var expired_session = this._parsed_session;
          this._parsed_session = null;
          if (expired_session) {
            if (to_terminal.length === 1 && to_terminal[0] === 67) {
              this._send_abort();
            }
            this._on_retract();
          }
        }
        this._to_terminal(to_terminal);
      }
      /**
       * @return {Session|null} The sentry’s current Session object, or
       *      null if there is none.
       */
      get_confirmed_session() {
        return this._zsession || null;
      }
      _send_abort() {
        this._sender(Zmodem.ZMLIB.ABORT_SEQUENCE);
      }
      /**
       * Parse an input stream and decide how much of it goes to the
       * terminal or to a new Session object.
       *
       * This will accommodate input strings that are fragmented
       * across calls to this function; e.g., if you send the first
       * two bytes at the end of one parse() call then send the rest
       * at the beginning of the next, parse() will recognize it as
       * the beginning of a ZMODEM session.
       *
       * In order to keep from blocking any actual useful data to the
       * terminal in real-time, this will send on the initial
       * ZRINIT/ZRQINIT bytes to the terminal. They’re meant to go to the
       * terminal anyway, so that should be fine.
       *
       * @private
       *
       * @param {Array|Uint8Array} array_like - The input bytes.
       *      Each member should be a number between 0 and 255 (inclusive).
       *
       * @return {Array} A two-member list:
       *      0) the bytes that should be printed on the terminal
       *      1) the created Session object (if any)
       */
      _parse(array_like) {
        var cache = this._cache;
        cache.push.apply(cache, array_like);
        while (true) {
          let common_hex_at = Zmodem.ZMLIB.find_subarray(cache, COMMON_ZM_HEX_START);
          if (-1 === common_hex_at) break;
          cache.splice(0, common_hex_at);
          let zsession2;
          try {
            zsession2 = Zmodem.Session.parse(cache);
          } catch (err) {
          }
          if (!zsession2) break;
          if (cache.length === 1 && cache[0] === Zmodem.ZMLIB.XON) {
            cache.shift();
          }
          return cache.length ? null : zsession2;
        }
        cache.splice(MAX_ZM_HEX_START_LENGTH);
        return null;
      }
    };
  })(zsentry);
  return zsentry.exports;
}
var hasRequiredZmodem;
function requireZmodem() {
  if (hasRequiredZmodem) return zmodem.exports;
  hasRequiredZmodem = 1;
  (function(module) {
    Object.assign(
      module.exports,
      requireZsentry()
    );
  })(zmodem);
  return zmodem.exports;
}
var hasRequiredZmodem_browser;
function requireZmodem_browser() {
  if (hasRequiredZmodem_browser) return zmodem_browser.exports;
  hasRequiredZmodem_browser = 1;
  (function(module) {
    var Zmodem = module.exports;
    window.Zmodem = Zmodem;
    Object.assign(
      Zmodem,
      requireZmodem()
    );
    function _check_aborted(session) {
      if (session.aborted()) {
        throw new Zmodem.Error("aborted");
      }
    }
    Zmodem.Browser = {
      /**
       * Send a batch of files in sequence. The session is left open
       * afterward, which allows for more files to be sent if desired.
       *
       * @param {Zmodem.Session} session - The send session
       *
       * @param {FileList|Array} files - A list of File objects
       *
       * @param {Object} [options]
       * @param {Function} [options.on_offer_response] - Called when an
       * offer response arrives. Arguments are:
       *
       * - (File) - The File object that corresponds to the offer.
       * - (Transfer|undefined) - If the receiver accepts the offer, then
       * this is a Transfer object; otherwise it’s undefined.
       *
       * @param {Function} [options.on_progress] - Called immediately
       * after a chunk of a file is sent. Arguments are:
       *
       * - (File) - The File object that corresponds to the file.
       * - (Transfer) - The Transfer object for the current transfer.
       * - (Uint8Array) - The chunk of data that was just loaded from disk
       * and sent to the receiver.
       *
       * @param {Function} [options.on_file_complete] - Called immediately
       * after the last file packet is sent. Arguments are:
       *
       * - (File) - The File object that corresponds to the file.
       * - (Transfer) - The Transfer object for the now-completed transfer.
       *
       * @return {Promise} A Promise that fulfills when the batch is done.
       *      Note that skipped files are not considered an error condition.
       */
      send_files: function send_files(session, files, options) {
        if (!options) options = {};
        var batch = [];
        var total_size = 0;
        for (var f2 = files.length - 1; f2 >= 0; f2--) {
          var fobj = files[f2];
          total_size += fobj.size;
          batch[f2] = {
            obj: fobj,
            name: fobj.name,
            size: fobj.size,
            mtime: new Date(fobj.lastModified),
            files_remaining: files.length - f2,
            bytes_remaining: total_size
          };
        }
        var file_idx = 0;
        function promise_callback() {
          var cur_b = batch[file_idx];
          if (!cur_b) {
            return Promise.resolve();
          }
          file_idx++;
          return session.send_offer(cur_b).then(function after_send_offer(xfer) {
            if (options.on_offer_response) {
              options.on_offer_response(cur_b.obj, xfer);
            }
            if (xfer === void 0) {
              return promise_callback();
            }
            return new Promise(function(res) {
              var reader = new FileReader();
              reader.onerror = function reader_onerror(e2) {
                console.error("file read error", e2);
                throw "File read error: " + e2;
              };
              var piece;
              reader.onprogress = function reader_onprogress(e2) {
                if (e2.target.result) {
                  piece = new Uint8Array(e2.target.result, xfer.get_offset());
                  _check_aborted(session);
                  xfer.send(piece);
                  if (options.on_progress) {
                    options.on_progress(cur_b.obj, xfer, piece);
                  }
                }
              };
              reader.onload = function reader_onload(e2) {
                piece = new Uint8Array(e2.target.result, xfer, piece);
                _check_aborted(session);
                xfer.end(piece).then(function() {
                  if (options.on_progress && piece.length) {
                    options.on_progress(cur_b.obj, xfer, piece);
                  }
                  if (options.on_file_complete) {
                    options.on_file_complete(cur_b.obj, xfer);
                  }
                  res(promise_callback());
                });
              };
              reader.readAsArrayBuffer(cur_b.obj);
            });
          });
        }
        return promise_callback();
      },
      /**
       * Prompt a user to save the given packets as a file by injecting an
       * `<a>` element (with `display: none` styling) into the page and
       * calling the element’s `click()`
       * method. The element is removed immediately after.
       *
       * @param {Array} packets - Same as the first argument to [Blob’s constructor](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
       * @param {string} name - The name to give the file.
       */
      save_to_disk: function save_to_disk(packets, name2) {
        var blob = new Blob(packets);
        var url = URL.createObjectURL(blob);
        var el = document.createElement("a");
        el.style.display = "none";
        el.href = url;
        el.download = name2;
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
      }
    };
  })(zmodem_browser);
  return zmodem_browser.exports;
}
var zmodem_browserExports = requireZmodem_browser();
function t(t2, e2, i2, r2) {
  return new (i2 || (i2 = Promise))(function(n2, s2) {
    function a2(t3) {
      try {
        l2(r2.next(t3));
      } catch (t4) {
        s2(t4);
      }
    }
    function o2(t3) {
      try {
        l2(r2.throw(t3));
      } catch (t4) {
        s2(t4);
      }
    }
    function l2(t3) {
      var e3;
      t3.done ? n2(t3.value) : (e3 = t3.value, e3 instanceof i2 ? e3 : new i2(function(t4) {
        t4(e3);
      })).then(a2, o2);
    }
    l2((r2 = r2.apply(t2, e2 || [])).next());
  });
}
function e(t2) {
  var e2 = "function" == typeof Symbol && Symbol.iterator, i2 = e2 && t2[e2], r2 = 0;
  if (i2) return i2.call(t2);
  if (t2 && "number" == typeof t2.length) return { next: function() {
    return t2 && r2 >= t2.length && (t2 = void 0), { value: t2 && t2[r2++], done: !t2 };
  } };
  throw new TypeError(e2 ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function i(t2) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var i2, r2 = t2[Symbol.asyncIterator];
  return r2 ? r2.call(t2) : (t2 = e(t2), i2 = {}, n2("next"), n2("throw"), n2("return"), i2[Symbol.asyncIterator] = function() {
    return this;
  }, i2);
  function n2(e2) {
    i2[e2] = t2[e2] && function(i3) {
      return new Promise(function(r3, n3) {
        (function(t3, e3, i4, r4) {
          Promise.resolve(r4).then(function(e4) {
            t3({ value: e4, done: i4 });
          }, e3);
        })(r3, n3, (i3 = t2[e2](i3)).done, i3.value);
      });
    };
  }
}
"function" == typeof SuppressedError && SuppressedError;
function r(t2) {
  let e2 = t2.length;
  for (; --e2 >= 0; ) t2[e2] = 0;
}
const n = 256, s = 286, a = 30, o = 15, l = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]), h = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]), d = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]), u = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), f = new Array(576);
r(f);
const c = new Array(60);
r(c);
const _ = new Array(512);
r(_);
const w = new Array(256);
r(w);
const p = new Array(29);
r(p);
const m = new Array(a);
function g(t2, e2, i2, r2, n2) {
  this.static_tree = t2, this.extra_bits = e2, this.extra_base = i2, this.elems = r2, this.max_length = n2, this.has_stree = t2 && t2.length;
}
let y, b, v;
function k(t2, e2) {
  this.dyn_tree = t2, this.max_code = 0, this.stat_desc = e2;
}
r(m);
const x = (t2) => t2 < 256 ? _[t2] : _[256 + (t2 >>> 7)], z = (t2, e2) => {
  t2.pending_buf[t2.pending++] = 255 & e2, t2.pending_buf[t2.pending++] = e2 >>> 8 & 255;
}, A = (t2, e2, i2) => {
  t2.bi_valid > 16 - i2 ? (t2.bi_buf |= e2 << t2.bi_valid & 65535, z(t2, t2.bi_buf), t2.bi_buf = e2 >> 16 - t2.bi_valid, t2.bi_valid += i2 - 16) : (t2.bi_buf |= e2 << t2.bi_valid & 65535, t2.bi_valid += i2);
}, S = (t2, e2, i2) => {
  A(t2, i2[2 * e2], i2[2 * e2 + 1]);
}, T = (t2, e2) => {
  let i2 = 0;
  do {
    i2 |= 1 & t2, t2 >>>= 1, i2 <<= 1;
  } while (--e2 > 0);
  return i2 >>> 1;
}, F = (t2, e2, i2) => {
  const r2 = new Array(16);
  let n2, s2, a2 = 0;
  for (n2 = 1; n2 <= o; n2++) a2 = a2 + i2[n2 - 1] << 1, r2[n2] = a2;
  for (s2 = 0; s2 <= e2; s2++) {
    let e3 = t2[2 * s2 + 1];
    0 !== e3 && (t2[2 * s2] = T(r2[e3]++, e3));
  }
}, I = (t2) => {
  let e2;
  for (e2 = 0; e2 < s; e2++) t2.dyn_ltree[2 * e2] = 0;
  for (e2 = 0; e2 < a; e2++) t2.dyn_dtree[2 * e2] = 0;
  for (e2 = 0; e2 < 19; e2++) t2.bl_tree[2 * e2] = 0;
  t2.dyn_ltree[512] = 1, t2.opt_len = t2.static_len = 0, t2.sym_next = t2.matches = 0;
}, E = (t2) => {
  t2.bi_valid > 8 ? z(t2, t2.bi_buf) : t2.bi_valid > 0 && (t2.pending_buf[t2.pending++] = t2.bi_buf), t2.bi_buf = 0, t2.bi_valid = 0;
}, C = (t2, e2, i2, r2) => {
  const n2 = 2 * e2, s2 = 2 * i2;
  return t2[n2] < t2[s2] || t2[n2] === t2[s2] && r2[e2] <= r2[i2];
}, B = (t2, e2, i2) => {
  const r2 = t2.heap[i2];
  let n2 = i2 << 1;
  for (; n2 <= t2.heap_len && (n2 < t2.heap_len && C(e2, t2.heap[n2 + 1], t2.heap[n2], t2.depth) && n2++, !C(e2, r2, t2.heap[n2], t2.depth)); ) t2.heap[i2] = t2.heap[n2], i2 = n2, n2 <<= 1;
  t2.heap[i2] = r2;
}, D = (t2, e2, i2) => {
  let r2, s2, a2, o2, d2 = 0;
  if (0 !== t2.sym_next) do {
    r2 = 255 & t2.pending_buf[t2.sym_buf + d2++], r2 += (255 & t2.pending_buf[t2.sym_buf + d2++]) << 8, s2 = t2.pending_buf[t2.sym_buf + d2++], 0 === r2 ? S(t2, s2, e2) : (a2 = w[s2], S(t2, a2 + n + 1, e2), o2 = l[a2], 0 !== o2 && (s2 -= p[a2], A(t2, s2, o2)), r2--, a2 = x(r2), S(t2, a2, i2), o2 = h[a2], 0 !== o2 && (r2 -= m[a2], A(t2, r2, o2)));
  } while (d2 < t2.sym_next);
  S(t2, 256, e2);
}, R = (t2, e2) => {
  const i2 = e2.dyn_tree, r2 = e2.stat_desc.static_tree, n2 = e2.stat_desc.has_stree, s2 = e2.stat_desc.elems;
  let a2, l2, h2, d2 = -1;
  for (t2.heap_len = 0, t2.heap_max = 573, a2 = 0; a2 < s2; a2++) 0 !== i2[2 * a2] ? (t2.heap[++t2.heap_len] = d2 = a2, t2.depth[a2] = 0) : i2[2 * a2 + 1] = 0;
  for (; t2.heap_len < 2; ) h2 = t2.heap[++t2.heap_len] = d2 < 2 ? ++d2 : 0, i2[2 * h2] = 1, t2.depth[h2] = 0, t2.opt_len--, n2 && (t2.static_len -= r2[2 * h2 + 1]);
  for (e2.max_code = d2, a2 = t2.heap_len >> 1; a2 >= 1; a2--) B(t2, i2, a2);
  h2 = s2;
  do {
    a2 = t2.heap[1], t2.heap[1] = t2.heap[t2.heap_len--], B(t2, i2, 1), l2 = t2.heap[1], t2.heap[--t2.heap_max] = a2, t2.heap[--t2.heap_max] = l2, i2[2 * h2] = i2[2 * a2] + i2[2 * l2], t2.depth[h2] = (t2.depth[a2] >= t2.depth[l2] ? t2.depth[a2] : t2.depth[l2]) + 1, i2[2 * a2 + 1] = i2[2 * l2 + 1] = h2, t2.heap[1] = h2++, B(t2, i2, 1);
  } while (t2.heap_len >= 2);
  t2.heap[--t2.heap_max] = t2.heap[1], ((t3, e3) => {
    const i3 = e3.dyn_tree, r3 = e3.max_code, n3 = e3.stat_desc.static_tree, s3 = e3.stat_desc.has_stree, a3 = e3.stat_desc.extra_bits, l3 = e3.stat_desc.extra_base, h3 = e3.stat_desc.max_length;
    let d3, u2, f2, c2, _2, w2, p2 = 0;
    for (c2 = 0; c2 <= o; c2++) t3.bl_count[c2] = 0;
    for (i3[2 * t3.heap[t3.heap_max] + 1] = 0, d3 = t3.heap_max + 1; d3 < 573; d3++) u2 = t3.heap[d3], c2 = i3[2 * i3[2 * u2 + 1] + 1] + 1, c2 > h3 && (c2 = h3, p2++), i3[2 * u2 + 1] = c2, u2 > r3 || (t3.bl_count[c2]++, _2 = 0, u2 >= l3 && (_2 = a3[u2 - l3]), w2 = i3[2 * u2], t3.opt_len += w2 * (c2 + _2), s3 && (t3.static_len += w2 * (n3[2 * u2 + 1] + _2)));
    if (0 !== p2) {
      do {
        for (c2 = h3 - 1; 0 === t3.bl_count[c2]; ) c2--;
        t3.bl_count[c2]--, t3.bl_count[c2 + 1] += 2, t3.bl_count[h3]--, p2 -= 2;
      } while (p2 > 0);
      for (c2 = h3; 0 !== c2; c2--) for (u2 = t3.bl_count[c2]; 0 !== u2; ) f2 = t3.heap[--d3], f2 > r3 || (i3[2 * f2 + 1] !== c2 && (t3.opt_len += (c2 - i3[2 * f2 + 1]) * i3[2 * f2], i3[2 * f2 + 1] = c2), u2--);
    }
  })(t2, e2), F(i2, d2, t2.bl_count);
}, U = (t2, e2, i2) => {
  let r2, n2, s2 = -1, a2 = e2[1], o2 = 0, l2 = 7, h2 = 4;
  for (0 === a2 && (l2 = 138, h2 = 3), e2[2 * (i2 + 1) + 1] = 65535, r2 = 0; r2 <= i2; r2++) n2 = a2, a2 = e2[2 * (r2 + 1) + 1], ++o2 < l2 && n2 === a2 || (o2 < h2 ? t2.bl_tree[2 * n2] += o2 : 0 !== n2 ? (n2 !== s2 && t2.bl_tree[2 * n2]++, t2.bl_tree[32]++) : o2 <= 10 ? t2.bl_tree[34]++ : t2.bl_tree[36]++, o2 = 0, s2 = n2, 0 === a2 ? (l2 = 138, h2 = 3) : n2 === a2 ? (l2 = 6, h2 = 3) : (l2 = 7, h2 = 4));
}, N = (t2, e2, i2) => {
  let r2, n2, s2 = -1, a2 = e2[1], o2 = 0, l2 = 7, h2 = 4;
  for (0 === a2 && (l2 = 138, h2 = 3), r2 = 0; r2 <= i2; r2++) if (n2 = a2, a2 = e2[2 * (r2 + 1) + 1], !(++o2 < l2 && n2 === a2)) {
    if (o2 < h2) do {
      S(t2, n2, t2.bl_tree);
    } while (0 !== --o2);
    else 0 !== n2 ? (n2 !== s2 && (S(t2, n2, t2.bl_tree), o2--), S(t2, 16, t2.bl_tree), A(t2, o2 - 3, 2)) : o2 <= 10 ? (S(t2, 17, t2.bl_tree), A(t2, o2 - 3, 3)) : (S(t2, 18, t2.bl_tree), A(t2, o2 - 11, 7));
    o2 = 0, s2 = n2, 0 === a2 ? (l2 = 138, h2 = 3) : n2 === a2 ? (l2 = 6, h2 = 3) : (l2 = 7, h2 = 4);
  }
};
let L = false;
const P = (t2, e2, i2, r2) => {
  A(t2, 0 + (r2 ? 1 : 0), 3), E(t2), z(t2, i2), z(t2, ~i2), i2 && t2.pending_buf.set(t2.window.subarray(e2, e2 + i2), t2.pending), t2.pending += i2;
};
var O = (t2, e2, i2, r2) => {
  let s2, a2, o2 = 0;
  t2.level > 0 ? (2 === t2.strm.data_type && (t2.strm.data_type = ((t3) => {
    let e3, i3 = 4093624447;
    for (e3 = 0; e3 <= 31; e3++, i3 >>>= 1) if (1 & i3 && 0 !== t3.dyn_ltree[2 * e3]) return 0;
    if (0 !== t3.dyn_ltree[18] || 0 !== t3.dyn_ltree[20] || 0 !== t3.dyn_ltree[26]) return 1;
    for (e3 = 32; e3 < n; e3++) if (0 !== t3.dyn_ltree[2 * e3]) return 1;
    return 0;
  })(t2)), R(t2, t2.l_desc), R(t2, t2.d_desc), o2 = ((t3) => {
    let e3;
    for (U(t3, t3.dyn_ltree, t3.l_desc.max_code), U(t3, t3.dyn_dtree, t3.d_desc.max_code), R(t3, t3.bl_desc), e3 = 18; e3 >= 3 && 0 === t3.bl_tree[2 * u[e3] + 1]; e3--) ;
    return t3.opt_len += 3 * (e3 + 1) + 5 + 5 + 4, e3;
  })(t2), s2 = t2.opt_len + 3 + 7 >>> 3, a2 = t2.static_len + 3 + 7 >>> 3, a2 <= s2 && (s2 = a2)) : s2 = a2 = i2 + 5, i2 + 4 <= s2 && -1 !== e2 ? P(t2, e2, i2, r2) : 4 === t2.strategy || a2 === s2 ? (A(t2, 2 + (r2 ? 1 : 0), 3), D(t2, f, c)) : (A(t2, 4 + (r2 ? 1 : 0), 3), ((t3, e3, i3, r3) => {
    let n2;
    for (A(t3, e3 - 257, 5), A(t3, i3 - 1, 5), A(t3, r3 - 4, 4), n2 = 0; n2 < r3; n2++) A(t3, t3.bl_tree[2 * u[n2] + 1], 3);
    N(t3, t3.dyn_ltree, e3 - 1), N(t3, t3.dyn_dtree, i3 - 1);
  })(t2, t2.l_desc.max_code + 1, t2.d_desc.max_code + 1, o2 + 1), D(t2, t2.dyn_ltree, t2.dyn_dtree)), I(t2), r2 && E(t2);
}, Z = { _tr_init: (t2) => {
  L || ((() => {
    let t3, e2, i2, r2, n2;
    const u2 = new Array(16);
    for (i2 = 0, r2 = 0; r2 < 28; r2++) for (p[r2] = i2, t3 = 0; t3 < 1 << l[r2]; t3++) w[i2++] = r2;
    for (w[i2 - 1] = r2, n2 = 0, r2 = 0; r2 < 16; r2++) for (m[r2] = n2, t3 = 0; t3 < 1 << h[r2]; t3++) _[n2++] = r2;
    for (n2 >>= 7; r2 < a; r2++) for (m[r2] = n2 << 7, t3 = 0; t3 < 1 << h[r2] - 7; t3++) _[256 + n2++] = r2;
    for (e2 = 0; e2 <= o; e2++) u2[e2] = 0;
    for (t3 = 0; t3 <= 143; ) f[2 * t3 + 1] = 8, t3++, u2[8]++;
    for (; t3 <= 255; ) f[2 * t3 + 1] = 9, t3++, u2[9]++;
    for (; t3 <= 279; ) f[2 * t3 + 1] = 7, t3++, u2[7]++;
    for (; t3 <= 287; ) f[2 * t3 + 1] = 8, t3++, u2[8]++;
    for (F(f, 287, u2), t3 = 0; t3 < a; t3++) c[2 * t3 + 1] = 5, c[2 * t3] = T(t3, 5);
    y = new g(f, l, 257, s, o), b = new g(c, h, 0, a, o), v = new g(new Array(0), d, 0, 19, 7);
  })(), L = true), t2.l_desc = new k(t2.dyn_ltree, y), t2.d_desc = new k(t2.dyn_dtree, b), t2.bl_desc = new k(t2.bl_tree, v), t2.bi_buf = 0, t2.bi_valid = 0, I(t2);
}, _tr_stored_block: P, _tr_flush_block: O, _tr_tally: (t2, e2, i2) => (t2.pending_buf[t2.sym_buf + t2.sym_next++] = e2, t2.pending_buf[t2.sym_buf + t2.sym_next++] = e2 >> 8, t2.pending_buf[t2.sym_buf + t2.sym_next++] = i2, 0 === e2 ? t2.dyn_ltree[2 * i2]++ : (t2.matches++, e2--, t2.dyn_ltree[2 * (w[i2] + n + 1)]++, t2.dyn_dtree[2 * x(e2)]++), t2.sym_next === t2.sym_end), _tr_align: (t2) => {
  A(t2, 2, 3), S(t2, 256, f), ((t3) => {
    16 === t3.bi_valid ? (z(t3, t3.bi_buf), t3.bi_buf = 0, t3.bi_valid = 0) : t3.bi_valid >= 8 && (t3.pending_buf[t3.pending++] = 255 & t3.bi_buf, t3.bi_buf >>= 8, t3.bi_valid -= 8);
  })(t2);
} };
var M = (t2, e2, i2, r2) => {
  let n2 = 65535 & t2, s2 = t2 >>> 16 & 65535, a2 = 0;
  for (; 0 !== i2; ) {
    a2 = i2 > 2e3 ? 2e3 : i2, i2 -= a2;
    do {
      n2 = n2 + e2[r2++] | 0, s2 = s2 + n2 | 0;
    } while (--a2);
    n2 %= 65521, s2 %= 65521;
  }
  return n2 | s2 << 16;
};
const $ = new Uint32Array((() => {
  let t2, e2 = [];
  for (var i2 = 0; i2 < 256; i2++) {
    t2 = i2;
    for (var r2 = 0; r2 < 8; r2++) t2 = 1 & t2 ? 3988292384 ^ t2 >>> 1 : t2 >>> 1;
    e2[i2] = t2;
  }
  return e2;
})());
var j = (t2, e2, i2, r2) => {
  const n2 = $, s2 = r2 + i2;
  t2 ^= -1;
  for (let i3 = r2; i3 < s2; i3++) t2 = t2 >>> 8 ^ n2[255 & (t2 ^ e2[i3])];
  return -1 ^ t2;
}, H = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" }, W = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_MEM_ERROR: -4, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
const { _tr_init: q, _tr_stored_block: K, _tr_flush_block: J, _tr_tally: X, _tr_align: G } = Z, { Z_NO_FLUSH: Y, Z_PARTIAL_FLUSH: Q, Z_FULL_FLUSH: V, Z_FINISH: tt, Z_BLOCK: et, Z_OK: it, Z_STREAM_END: rt, Z_STREAM_ERROR: nt, Z_DATA_ERROR: st, Z_BUF_ERROR: at, Z_DEFAULT_COMPRESSION: ot, Z_FILTERED: lt, Z_HUFFMAN_ONLY: ht, Z_RLE: dt, Z_FIXED: ut, Z_DEFAULT_STRATEGY: ft, Z_UNKNOWN: ct, Z_DEFLATED: _t } = W, wt = 258, pt = 262, mt = 42, gt = 113, yt = 666, bt = (t2, e2) => (t2.msg = H[e2], e2), vt = (t2) => 2 * t2 - (t2 > 4 ? 9 : 0), kt = (t2) => {
  let e2 = t2.length;
  for (; --e2 >= 0; ) t2[e2] = 0;
}, xt = (t2) => {
  let e2, i2, r2, n2 = t2.w_size;
  e2 = t2.hash_size, r2 = e2;
  do {
    i2 = t2.head[--r2], t2.head[r2] = i2 >= n2 ? i2 - n2 : 0;
  } while (--e2);
  e2 = n2, r2 = e2;
  do {
    i2 = t2.prev[--r2], t2.prev[r2] = i2 >= n2 ? i2 - n2 : 0;
  } while (--e2);
};
let zt = (t2, e2, i2) => (e2 << t2.hash_shift ^ i2) & t2.hash_mask;
const At = (t2) => {
  const e2 = t2.state;
  let i2 = e2.pending;
  i2 > t2.avail_out && (i2 = t2.avail_out), 0 !== i2 && (t2.output.set(e2.pending_buf.subarray(e2.pending_out, e2.pending_out + i2), t2.next_out), t2.next_out += i2, e2.pending_out += i2, t2.total_out += i2, t2.avail_out -= i2, e2.pending -= i2, 0 === e2.pending && (e2.pending_out = 0));
}, St = (t2, e2) => {
  J(t2, t2.block_start >= 0 ? t2.block_start : -1, t2.strstart - t2.block_start, e2), t2.block_start = t2.strstart, At(t2.strm);
}, Tt = (t2, e2) => {
  t2.pending_buf[t2.pending++] = e2;
}, Ft = (t2, e2) => {
  t2.pending_buf[t2.pending++] = e2 >>> 8 & 255, t2.pending_buf[t2.pending++] = 255 & e2;
}, It = (t2, e2, i2, r2) => {
  let n2 = t2.avail_in;
  return n2 > r2 && (n2 = r2), 0 === n2 ? 0 : (t2.avail_in -= n2, e2.set(t2.input.subarray(t2.next_in, t2.next_in + n2), i2), 1 === t2.state.wrap ? t2.adler = M(t2.adler, e2, n2, i2) : 2 === t2.state.wrap && (t2.adler = j(t2.adler, e2, n2, i2)), t2.next_in += n2, t2.total_in += n2, n2);
}, Et = (t2, e2) => {
  let i2, r2, n2 = t2.max_chain_length, s2 = t2.strstart, a2 = t2.prev_length, o2 = t2.nice_match;
  const l2 = t2.strstart > t2.w_size - pt ? t2.strstart - (t2.w_size - pt) : 0, h2 = t2.window, d2 = t2.w_mask, u2 = t2.prev, f2 = t2.strstart + wt;
  let c2 = h2[s2 + a2 - 1], _2 = h2[s2 + a2];
  t2.prev_length >= t2.good_match && (n2 >>= 2), o2 > t2.lookahead && (o2 = t2.lookahead);
  do {
    if (i2 = e2, h2[i2 + a2] === _2 && h2[i2 + a2 - 1] === c2 && h2[i2] === h2[s2] && h2[++i2] === h2[s2 + 1]) {
      s2 += 2, i2++;
      do {
      } while (h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && h2[++s2] === h2[++i2] && s2 < f2);
      if (r2 = wt - (f2 - s2), s2 = f2 - wt, r2 > a2) {
        if (t2.match_start = e2, a2 = r2, r2 >= o2) break;
        c2 = h2[s2 + a2 - 1], _2 = h2[s2 + a2];
      }
    }
  } while ((e2 = u2[e2 & d2]) > l2 && 0 !== --n2);
  return a2 <= t2.lookahead ? a2 : t2.lookahead;
}, Ct = (t2) => {
  const e2 = t2.w_size;
  let i2, r2, n2;
  do {
    if (r2 = t2.window_size - t2.lookahead - t2.strstart, t2.strstart >= e2 + (e2 - pt) && (t2.window.set(t2.window.subarray(e2, e2 + e2 - r2), 0), t2.match_start -= e2, t2.strstart -= e2, t2.block_start -= e2, t2.insert > t2.strstart && (t2.insert = t2.strstart), xt(t2), r2 += e2), 0 === t2.strm.avail_in) break;
    if (i2 = It(t2.strm, t2.window, t2.strstart + t2.lookahead, r2), t2.lookahead += i2, t2.lookahead + t2.insert >= 3) for (n2 = t2.strstart - t2.insert, t2.ins_h = t2.window[n2], t2.ins_h = zt(t2, t2.ins_h, t2.window[n2 + 1]); t2.insert && (t2.ins_h = zt(t2, t2.ins_h, t2.window[n2 + 3 - 1]), t2.prev[n2 & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = n2, n2++, t2.insert--, !(t2.lookahead + t2.insert < 3)); ) ;
  } while (t2.lookahead < pt && 0 !== t2.strm.avail_in);
}, Bt = (t2, e2) => {
  let i2, r2, n2, s2 = t2.pending_buf_size - 5 > t2.w_size ? t2.w_size : t2.pending_buf_size - 5, a2 = 0, o2 = t2.strm.avail_in;
  do {
    if (i2 = 65535, n2 = t2.bi_valid + 42 >> 3, t2.strm.avail_out < n2) break;
    if (n2 = t2.strm.avail_out - n2, r2 = t2.strstart - t2.block_start, i2 > r2 + t2.strm.avail_in && (i2 = r2 + t2.strm.avail_in), i2 > n2 && (i2 = n2), i2 < s2 && (0 === i2 && e2 !== tt || e2 === Y || i2 !== r2 + t2.strm.avail_in)) break;
    a2 = e2 === tt && i2 === r2 + t2.strm.avail_in ? 1 : 0, K(t2, 0, 0, a2), t2.pending_buf[t2.pending - 4] = i2, t2.pending_buf[t2.pending - 3] = i2 >> 8, t2.pending_buf[t2.pending - 2] = ~i2, t2.pending_buf[t2.pending - 1] = ~i2 >> 8, At(t2.strm), r2 && (r2 > i2 && (r2 = i2), t2.strm.output.set(t2.window.subarray(t2.block_start, t2.block_start + r2), t2.strm.next_out), t2.strm.next_out += r2, t2.strm.avail_out -= r2, t2.strm.total_out += r2, t2.block_start += r2, i2 -= r2), i2 && (It(t2.strm, t2.strm.output, t2.strm.next_out, i2), t2.strm.next_out += i2, t2.strm.avail_out -= i2, t2.strm.total_out += i2);
  } while (0 === a2);
  return o2 -= t2.strm.avail_in, o2 && (o2 >= t2.w_size ? (t2.matches = 2, t2.window.set(t2.strm.input.subarray(t2.strm.next_in - t2.w_size, t2.strm.next_in), 0), t2.strstart = t2.w_size, t2.insert = t2.strstart) : (t2.window_size - t2.strstart <= o2 && (t2.strstart -= t2.w_size, t2.window.set(t2.window.subarray(t2.w_size, t2.w_size + t2.strstart), 0), t2.matches < 2 && t2.matches++, t2.insert > t2.strstart && (t2.insert = t2.strstart)), t2.window.set(t2.strm.input.subarray(t2.strm.next_in - o2, t2.strm.next_in), t2.strstart), t2.strstart += o2, t2.insert += o2 > t2.w_size - t2.insert ? t2.w_size - t2.insert : o2), t2.block_start = t2.strstart), t2.high_water < t2.strstart && (t2.high_water = t2.strstart), a2 ? 4 : e2 !== Y && e2 !== tt && 0 === t2.strm.avail_in && t2.strstart === t2.block_start ? 2 : (n2 = t2.window_size - t2.strstart, t2.strm.avail_in > n2 && t2.block_start >= t2.w_size && (t2.block_start -= t2.w_size, t2.strstart -= t2.w_size, t2.window.set(t2.window.subarray(t2.w_size, t2.w_size + t2.strstart), 0), t2.matches < 2 && t2.matches++, n2 += t2.w_size, t2.insert > t2.strstart && (t2.insert = t2.strstart)), n2 > t2.strm.avail_in && (n2 = t2.strm.avail_in), n2 && (It(t2.strm, t2.window, t2.strstart, n2), t2.strstart += n2, t2.insert += n2 > t2.w_size - t2.insert ? t2.w_size - t2.insert : n2), t2.high_water < t2.strstart && (t2.high_water = t2.strstart), n2 = t2.bi_valid + 42 >> 3, n2 = t2.pending_buf_size - n2 > 65535 ? 65535 : t2.pending_buf_size - n2, s2 = n2 > t2.w_size ? t2.w_size : n2, r2 = t2.strstart - t2.block_start, (r2 >= s2 || (r2 || e2 === tt) && e2 !== Y && 0 === t2.strm.avail_in && r2 <= n2) && (i2 = r2 > n2 ? n2 : r2, a2 = e2 === tt && 0 === t2.strm.avail_in && i2 === r2 ? 1 : 0, K(t2, t2.block_start, i2, a2), t2.block_start += i2, At(t2.strm)), a2 ? 3 : 1);
}, Dt = (t2, e2) => {
  let i2, r2;
  for (; ; ) {
    if (t2.lookahead < pt) {
      if (Ct(t2), t2.lookahead < pt && e2 === Y) return 1;
      if (0 === t2.lookahead) break;
    }
    if (i2 = 0, t2.lookahead >= 3 && (t2.ins_h = zt(t2, t2.ins_h, t2.window[t2.strstart + 3 - 1]), i2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart), 0 !== i2 && t2.strstart - i2 <= t2.w_size - pt && (t2.match_length = Et(t2, i2)), t2.match_length >= 3) if (r2 = X(t2, t2.strstart - t2.match_start, t2.match_length - 3), t2.lookahead -= t2.match_length, t2.match_length <= t2.max_lazy_match && t2.lookahead >= 3) {
      t2.match_length--;
      do {
        t2.strstart++, t2.ins_h = zt(t2, t2.ins_h, t2.window[t2.strstart + 3 - 1]), i2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart;
      } while (0 !== --t2.match_length);
      t2.strstart++;
    } else t2.strstart += t2.match_length, t2.match_length = 0, t2.ins_h = t2.window[t2.strstart], t2.ins_h = zt(t2, t2.ins_h, t2.window[t2.strstart + 1]);
    else r2 = X(t2, 0, t2.window[t2.strstart]), t2.lookahead--, t2.strstart++;
    if (r2 && (St(t2, false), 0 === t2.strm.avail_out)) return 1;
  }
  return t2.insert = t2.strstart < 2 ? t2.strstart : 2, e2 === tt ? (St(t2, true), 0 === t2.strm.avail_out ? 3 : 4) : t2.sym_next && (St(t2, false), 0 === t2.strm.avail_out) ? 1 : 2;
}, Rt = (t2, e2) => {
  let i2, r2, n2;
  for (; ; ) {
    if (t2.lookahead < pt) {
      if (Ct(t2), t2.lookahead < pt && e2 === Y) return 1;
      if (0 === t2.lookahead) break;
    }
    if (i2 = 0, t2.lookahead >= 3 && (t2.ins_h = zt(t2, t2.ins_h, t2.window[t2.strstart + 3 - 1]), i2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart), t2.prev_length = t2.match_length, t2.prev_match = t2.match_start, t2.match_length = 2, 0 !== i2 && t2.prev_length < t2.max_lazy_match && t2.strstart - i2 <= t2.w_size - pt && (t2.match_length = Et(t2, i2), t2.match_length <= 5 && (t2.strategy === lt || 3 === t2.match_length && t2.strstart - t2.match_start > 4096) && (t2.match_length = 2)), t2.prev_length >= 3 && t2.match_length <= t2.prev_length) {
      n2 = t2.strstart + t2.lookahead - 3, r2 = X(t2, t2.strstart - 1 - t2.prev_match, t2.prev_length - 3), t2.lookahead -= t2.prev_length - 1, t2.prev_length -= 2;
      do {
        ++t2.strstart <= n2 && (t2.ins_h = zt(t2, t2.ins_h, t2.window[t2.strstart + 3 - 1]), i2 = t2.prev[t2.strstart & t2.w_mask] = t2.head[t2.ins_h], t2.head[t2.ins_h] = t2.strstart);
      } while (0 !== --t2.prev_length);
      if (t2.match_available = 0, t2.match_length = 2, t2.strstart++, r2 && (St(t2, false), 0 === t2.strm.avail_out)) return 1;
    } else if (t2.match_available) {
      if (r2 = X(t2, 0, t2.window[t2.strstart - 1]), r2 && St(t2, false), t2.strstart++, t2.lookahead--, 0 === t2.strm.avail_out) return 1;
    } else t2.match_available = 1, t2.strstart++, t2.lookahead--;
  }
  return t2.match_available && (r2 = X(t2, 0, t2.window[t2.strstart - 1]), t2.match_available = 0), t2.insert = t2.strstart < 2 ? t2.strstart : 2, e2 === tt ? (St(t2, true), 0 === t2.strm.avail_out ? 3 : 4) : t2.sym_next && (St(t2, false), 0 === t2.strm.avail_out) ? 1 : 2;
};
function Ut(t2, e2, i2, r2, n2) {
  this.good_length = t2, this.max_lazy = e2, this.nice_length = i2, this.max_chain = r2, this.func = n2;
}
const Nt = [new Ut(0, 0, 0, 0, Bt), new Ut(4, 4, 8, 4, Dt), new Ut(4, 5, 16, 8, Dt), new Ut(4, 6, 32, 32, Dt), new Ut(4, 4, 16, 16, Rt), new Ut(8, 16, 32, 32, Rt), new Ut(8, 16, 128, 128, Rt), new Ut(8, 32, 128, 256, Rt), new Ut(32, 128, 258, 1024, Rt), new Ut(32, 258, 258, 4096, Rt)];
function Lt() {
  this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = _t, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new Uint16Array(1146), this.dyn_dtree = new Uint16Array(122), this.bl_tree = new Uint16Array(78), kt(this.dyn_ltree), kt(this.dyn_dtree), kt(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new Uint16Array(16), this.heap = new Uint16Array(573), kt(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new Uint16Array(573), kt(this.depth), this.sym_buf = 0, this.lit_bufsize = 0, this.sym_next = 0, this.sym_end = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
}
const Pt = (t2) => {
  if (!t2) return 1;
  const e2 = t2.state;
  return !e2 || e2.strm !== t2 || e2.status !== mt && 57 !== e2.status && 69 !== e2.status && 73 !== e2.status && 91 !== e2.status && 103 !== e2.status && e2.status !== gt && e2.status !== yt ? 1 : 0;
}, Ot = (t2) => {
  if (Pt(t2)) return bt(t2, nt);
  t2.total_in = t2.total_out = 0, t2.data_type = ct;
  const e2 = t2.state;
  return e2.pending = 0, e2.pending_out = 0, e2.wrap < 0 && (e2.wrap = -e2.wrap), e2.status = 2 === e2.wrap ? 57 : e2.wrap ? mt : gt, t2.adler = 2 === e2.wrap ? 0 : 1, e2.last_flush = -2, q(e2), it;
}, Zt = (t2) => {
  const e2 = Ot(t2);
  var i2;
  return e2 === it && ((i2 = t2.state).window_size = 2 * i2.w_size, kt(i2.head), i2.max_lazy_match = Nt[i2.level].max_lazy, i2.good_match = Nt[i2.level].good_length, i2.nice_match = Nt[i2.level].nice_length, i2.max_chain_length = Nt[i2.level].max_chain, i2.strstart = 0, i2.block_start = 0, i2.lookahead = 0, i2.insert = 0, i2.match_length = i2.prev_length = 2, i2.match_available = 0, i2.ins_h = 0), e2;
}, Mt = (t2, e2, i2, r2, n2, s2) => {
  if (!t2) return nt;
  let a2 = 1;
  if (e2 === ot && (e2 = 6), r2 < 0 ? (a2 = 0, r2 = -r2) : r2 > 15 && (a2 = 2, r2 -= 16), n2 < 1 || n2 > 9 || i2 !== _t || r2 < 8 || r2 > 15 || e2 < 0 || e2 > 9 || s2 < 0 || s2 > ut || 8 === r2 && 1 !== a2) return bt(t2, nt);
  8 === r2 && (r2 = 9);
  const o2 = new Lt();
  return t2.state = o2, o2.strm = t2, o2.status = mt, o2.wrap = a2, o2.gzhead = null, o2.w_bits = r2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = n2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + 3 - 1) / 3), o2.window = new Uint8Array(2 * o2.w_size), o2.head = new Uint16Array(o2.hash_size), o2.prev = new Uint16Array(o2.w_size), o2.lit_bufsize = 1 << n2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new Uint8Array(o2.pending_buf_size), o2.sym_buf = o2.lit_bufsize, o2.sym_end = 3 * (o2.lit_bufsize - 1), o2.level = e2, o2.strategy = s2, o2.method = i2, Zt(t2);
};
var $t = { deflateInit: (t2, e2) => Mt(t2, e2, _t, 15, 8, ft), deflateInit2: Mt, deflateReset: Zt, deflateResetKeep: Ot, deflateSetHeader: (t2, e2) => Pt(t2) || 2 !== t2.state.wrap ? nt : (t2.state.gzhead = e2, it), deflate: (t2, e2) => {
  if (Pt(t2) || e2 > et || e2 < 0) return t2 ? bt(t2, nt) : nt;
  const i2 = t2.state;
  if (!t2.output || 0 !== t2.avail_in && !t2.input || i2.status === yt && e2 !== tt) return bt(t2, 0 === t2.avail_out ? at : nt);
  const r2 = i2.last_flush;
  if (i2.last_flush = e2, 0 !== i2.pending) {
    if (At(t2), 0 === t2.avail_out) return i2.last_flush = -1, it;
  } else if (0 === t2.avail_in && vt(e2) <= vt(r2) && e2 !== tt) return bt(t2, at);
  if (i2.status === yt && 0 !== t2.avail_in) return bt(t2, at);
  if (i2.status === mt && 0 === i2.wrap && (i2.status = gt), i2.status === mt) {
    let e3 = _t + (i2.w_bits - 8 << 4) << 8, r3 = -1;
    if (r3 = i2.strategy >= ht || i2.level < 2 ? 0 : i2.level < 6 ? 1 : 6 === i2.level ? 2 : 3, e3 |= r3 << 6, 0 !== i2.strstart && (e3 |= 32), e3 += 31 - e3 % 31, Ft(i2, e3), 0 !== i2.strstart && (Ft(i2, t2.adler >>> 16), Ft(i2, 65535 & t2.adler)), t2.adler = 1, i2.status = gt, At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
  }
  if (57 === i2.status) {
    if (t2.adler = 0, Tt(i2, 31), Tt(i2, 139), Tt(i2, 8), i2.gzhead) Tt(i2, (i2.gzhead.text ? 1 : 0) + (i2.gzhead.hcrc ? 2 : 0) + (i2.gzhead.extra ? 4 : 0) + (i2.gzhead.name ? 8 : 0) + (i2.gzhead.comment ? 16 : 0)), Tt(i2, 255 & i2.gzhead.time), Tt(i2, i2.gzhead.time >> 8 & 255), Tt(i2, i2.gzhead.time >> 16 & 255), Tt(i2, i2.gzhead.time >> 24 & 255), Tt(i2, 9 === i2.level ? 2 : i2.strategy >= ht || i2.level < 2 ? 4 : 0), Tt(i2, 255 & i2.gzhead.os), i2.gzhead.extra && i2.gzhead.extra.length && (Tt(i2, 255 & i2.gzhead.extra.length), Tt(i2, i2.gzhead.extra.length >> 8 & 255)), i2.gzhead.hcrc && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending, 0)), i2.gzindex = 0, i2.status = 69;
    else if (Tt(i2, 0), Tt(i2, 0), Tt(i2, 0), Tt(i2, 0), Tt(i2, 0), Tt(i2, 9 === i2.level ? 2 : i2.strategy >= ht || i2.level < 2 ? 4 : 0), Tt(i2, 3), i2.status = gt, At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
  }
  if (69 === i2.status) {
    if (i2.gzhead.extra) {
      let e3 = i2.pending, r3 = (65535 & i2.gzhead.extra.length) - i2.gzindex;
      for (; i2.pending + r3 > i2.pending_buf_size; ) {
        let n3 = i2.pending_buf_size - i2.pending;
        if (i2.pending_buf.set(i2.gzhead.extra.subarray(i2.gzindex, i2.gzindex + n3), i2.pending), i2.pending = i2.pending_buf_size, i2.gzhead.hcrc && i2.pending > e3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - e3, e3)), i2.gzindex += n3, At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
        e3 = 0, r3 -= n3;
      }
      let n2 = new Uint8Array(i2.gzhead.extra);
      i2.pending_buf.set(n2.subarray(i2.gzindex, i2.gzindex + r3), i2.pending), i2.pending += r3, i2.gzhead.hcrc && i2.pending > e3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - e3, e3)), i2.gzindex = 0;
    }
    i2.status = 73;
  }
  if (73 === i2.status) {
    if (i2.gzhead.name) {
      let e3, r3 = i2.pending;
      do {
        if (i2.pending === i2.pending_buf_size) {
          if (i2.gzhead.hcrc && i2.pending > r3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - r3, r3)), At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
          r3 = 0;
        }
        e3 = i2.gzindex < i2.gzhead.name.length ? 255 & i2.gzhead.name.charCodeAt(i2.gzindex++) : 0, Tt(i2, e3);
      } while (0 !== e3);
      i2.gzhead.hcrc && i2.pending > r3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - r3, r3)), i2.gzindex = 0;
    }
    i2.status = 91;
  }
  if (91 === i2.status) {
    if (i2.gzhead.comment) {
      let e3, r3 = i2.pending;
      do {
        if (i2.pending === i2.pending_buf_size) {
          if (i2.gzhead.hcrc && i2.pending > r3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - r3, r3)), At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
          r3 = 0;
        }
        e3 = i2.gzindex < i2.gzhead.comment.length ? 255 & i2.gzhead.comment.charCodeAt(i2.gzindex++) : 0, Tt(i2, e3);
      } while (0 !== e3);
      i2.gzhead.hcrc && i2.pending > r3 && (t2.adler = j(t2.adler, i2.pending_buf, i2.pending - r3, r3));
    }
    i2.status = 103;
  }
  if (103 === i2.status) {
    if (i2.gzhead.hcrc) {
      if (i2.pending + 2 > i2.pending_buf_size && (At(t2), 0 !== i2.pending)) return i2.last_flush = -1, it;
      Tt(i2, 255 & t2.adler), Tt(i2, t2.adler >> 8 & 255), t2.adler = 0;
    }
    if (i2.status = gt, At(t2), 0 !== i2.pending) return i2.last_flush = -1, it;
  }
  if (0 !== t2.avail_in || 0 !== i2.lookahead || e2 !== Y && i2.status !== yt) {
    let r3 = 0 === i2.level ? Bt(i2, e2) : i2.strategy === ht ? ((t3, e3) => {
      let i3;
      for (; ; ) {
        if (0 === t3.lookahead && (Ct(t3), 0 === t3.lookahead)) {
          if (e3 === Y) return 1;
          break;
        }
        if (t3.match_length = 0, i3 = X(t3, 0, t3.window[t3.strstart]), t3.lookahead--, t3.strstart++, i3 && (St(t3, false), 0 === t3.strm.avail_out)) return 1;
      }
      return t3.insert = 0, e3 === tt ? (St(t3, true), 0 === t3.strm.avail_out ? 3 : 4) : t3.sym_next && (St(t3, false), 0 === t3.strm.avail_out) ? 1 : 2;
    })(i2, e2) : i2.strategy === dt ? ((t3, e3) => {
      let i3, r4, n2, s2;
      const a2 = t3.window;
      for (; ; ) {
        if (t3.lookahead <= wt) {
          if (Ct(t3), t3.lookahead <= wt && e3 === Y) return 1;
          if (0 === t3.lookahead) break;
        }
        if (t3.match_length = 0, t3.lookahead >= 3 && t3.strstart > 0 && (n2 = t3.strstart - 1, r4 = a2[n2], r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2])) {
          s2 = t3.strstart + wt;
          do {
          } while (r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && r4 === a2[++n2] && n2 < s2);
          t3.match_length = wt - (s2 - n2), t3.match_length > t3.lookahead && (t3.match_length = t3.lookahead);
        }
        if (t3.match_length >= 3 ? (i3 = X(t3, 1, t3.match_length - 3), t3.lookahead -= t3.match_length, t3.strstart += t3.match_length, t3.match_length = 0) : (i3 = X(t3, 0, t3.window[t3.strstart]), t3.lookahead--, t3.strstart++), i3 && (St(t3, false), 0 === t3.strm.avail_out)) return 1;
      }
      return t3.insert = 0, e3 === tt ? (St(t3, true), 0 === t3.strm.avail_out ? 3 : 4) : t3.sym_next && (St(t3, false), 0 === t3.strm.avail_out) ? 1 : 2;
    })(i2, e2) : Nt[i2.level].func(i2, e2);
    if (3 !== r3 && 4 !== r3 || (i2.status = yt), 1 === r3 || 3 === r3) return 0 === t2.avail_out && (i2.last_flush = -1), it;
    if (2 === r3 && (e2 === Q ? G(i2) : e2 !== et && (K(i2, 0, 0, false), e2 === V && (kt(i2.head), 0 === i2.lookahead && (i2.strstart = 0, i2.block_start = 0, i2.insert = 0))), At(t2), 0 === t2.avail_out)) return i2.last_flush = -1, it;
  }
  return e2 !== tt ? it : i2.wrap <= 0 ? rt : (2 === i2.wrap ? (Tt(i2, 255 & t2.adler), Tt(i2, t2.adler >> 8 & 255), Tt(i2, t2.adler >> 16 & 255), Tt(i2, t2.adler >> 24 & 255), Tt(i2, 255 & t2.total_in), Tt(i2, t2.total_in >> 8 & 255), Tt(i2, t2.total_in >> 16 & 255), Tt(i2, t2.total_in >> 24 & 255)) : (Ft(i2, t2.adler >>> 16), Ft(i2, 65535 & t2.adler)), At(t2), i2.wrap > 0 && (i2.wrap = -i2.wrap), 0 !== i2.pending ? it : rt);
}, deflateEnd: (t2) => {
  if (Pt(t2)) return nt;
  const e2 = t2.state.status;
  return t2.state = null, e2 === gt ? bt(t2, st) : it;
}, deflateSetDictionary: (t2, e2) => {
  let i2 = e2.length;
  if (Pt(t2)) return nt;
  const r2 = t2.state, n2 = r2.wrap;
  if (2 === n2 || 1 === n2 && r2.status !== mt || r2.lookahead) return nt;
  if (1 === n2 && (t2.adler = M(t2.adler, e2, i2, 0)), r2.wrap = 0, i2 >= r2.w_size) {
    0 === n2 && (kt(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0);
    let t3 = new Uint8Array(r2.w_size);
    t3.set(e2.subarray(i2 - r2.w_size, i2), 0), e2 = t3, i2 = r2.w_size;
  }
  const s2 = t2.avail_in, a2 = t2.next_in, o2 = t2.input;
  for (t2.avail_in = i2, t2.next_in = 0, t2.input = e2, Ct(r2); r2.lookahead >= 3; ) {
    let t3 = r2.strstart, e3 = r2.lookahead - 2;
    do {
      r2.ins_h = zt(r2, r2.ins_h, r2.window[t3 + 3 - 1]), r2.prev[t3 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = t3, t3++;
    } while (--e3);
    r2.strstart = t3, r2.lookahead = 2, Ct(r2);
  }
  return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = 2, r2.match_available = 0, t2.next_in = a2, t2.input = o2, t2.avail_in = s2, r2.wrap = n2, it;
}, deflateInfo: "pako deflate (from Nodeca project)" };
const jt = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2);
var Ht = function(t2) {
  const e2 = Array.prototype.slice.call(arguments, 1);
  for (; e2.length; ) {
    const i2 = e2.shift();
    if (i2) {
      if ("object" != typeof i2) throw new TypeError(i2 + "must be non-object");
      for (const e3 in i2) jt(i2, e3) && (t2[e3] = i2[e3]);
    }
  }
  return t2;
}, Wt = (t2) => {
  let e2 = 0;
  for (let i3 = 0, r2 = t2.length; i3 < r2; i3++) e2 += t2[i3].length;
  const i2 = new Uint8Array(e2);
  for (let e3 = 0, r2 = 0, n2 = t2.length; e3 < n2; e3++) {
    let n3 = t2[e3];
    i2.set(n3, r2), r2 += n3.length;
  }
  return i2;
};
let qt = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (t2) {
  qt = false;
}
const Kt = new Uint8Array(256);
for (let t2 = 0; t2 < 256; t2++) Kt[t2] = t2 >= 252 ? 6 : t2 >= 248 ? 5 : t2 >= 240 ? 4 : t2 >= 224 ? 3 : t2 >= 192 ? 2 : 1;
Kt[254] = Kt[254] = 1;
var Jt = (t2) => {
  if ("function" == typeof TextEncoder && TextEncoder.prototype.encode) return new TextEncoder().encode(t2);
  let e2, i2, r2, n2, s2, a2 = t2.length, o2 = 0;
  for (n2 = 0; n2 < a2; n2++) i2 = t2.charCodeAt(n2), 55296 == (64512 & i2) && n2 + 1 < a2 && (r2 = t2.charCodeAt(n2 + 1), 56320 == (64512 & r2) && (i2 = 65536 + (i2 - 55296 << 10) + (r2 - 56320), n2++)), o2 += i2 < 128 ? 1 : i2 < 2048 ? 2 : i2 < 65536 ? 3 : 4;
  for (e2 = new Uint8Array(o2), s2 = 0, n2 = 0; s2 < o2; n2++) i2 = t2.charCodeAt(n2), 55296 == (64512 & i2) && n2 + 1 < a2 && (r2 = t2.charCodeAt(n2 + 1), 56320 == (64512 & r2) && (i2 = 65536 + (i2 - 55296 << 10) + (r2 - 56320), n2++)), i2 < 128 ? e2[s2++] = i2 : i2 < 2048 ? (e2[s2++] = 192 | i2 >>> 6, e2[s2++] = 128 | 63 & i2) : i2 < 65536 ? (e2[s2++] = 224 | i2 >>> 12, e2[s2++] = 128 | i2 >>> 6 & 63, e2[s2++] = 128 | 63 & i2) : (e2[s2++] = 240 | i2 >>> 18, e2[s2++] = 128 | i2 >>> 12 & 63, e2[s2++] = 128 | i2 >>> 6 & 63, e2[s2++] = 128 | 63 & i2);
  return e2;
}, Xt = (t2, e2) => {
  const i2 = e2 || t2.length;
  if ("function" == typeof TextDecoder && TextDecoder.prototype.decode) return new TextDecoder().decode(t2.subarray(0, e2));
  let r2, n2;
  const s2 = new Array(2 * i2);
  for (n2 = 0, r2 = 0; r2 < i2; ) {
    let e3 = t2[r2++];
    if (e3 < 128) {
      s2[n2++] = e3;
      continue;
    }
    let a2 = Kt[e3];
    if (a2 > 4) s2[n2++] = 65533, r2 += a2 - 1;
    else {
      for (e3 &= 2 === a2 ? 31 : 3 === a2 ? 15 : 7; a2 > 1 && r2 < i2; ) e3 = e3 << 6 | 63 & t2[r2++], a2--;
      a2 > 1 ? s2[n2++] = 65533 : e3 < 65536 ? s2[n2++] = e3 : (e3 -= 65536, s2[n2++] = 55296 | e3 >> 10 & 1023, s2[n2++] = 56320 | 1023 & e3);
    }
  }
  return ((t3, e3) => {
    if (e3 < 65534 && t3.subarray && qt) return String.fromCharCode.apply(null, t3.length === e3 ? t3 : t3.subarray(0, e3));
    let i3 = "";
    for (let r3 = 0; r3 < e3; r3++) i3 += String.fromCharCode(t3[r3]);
    return i3;
  })(s2, n2);
}, Gt = (t2, e2) => {
  (e2 = e2 || t2.length) > t2.length && (e2 = t2.length);
  let i2 = e2 - 1;
  for (; i2 >= 0 && 128 == (192 & t2[i2]); ) i2--;
  return i2 < 0 || 0 === i2 ? e2 : i2 + Kt[t2[i2]] > e2 ? i2 : e2;
};
var Yt = function() {
  this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
};
const Qt = Object.prototype.toString, { Z_NO_FLUSH: Vt, Z_SYNC_FLUSH: te, Z_FULL_FLUSH: ee, Z_FINISH: ie, Z_OK: re, Z_STREAM_END: ne, Z_DEFAULT_COMPRESSION: se, Z_DEFAULT_STRATEGY: ae, Z_DEFLATED: oe } = W;
function le(t2) {
  this.options = Ht({ level: se, method: oe, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: ae }, t2 || {});
  let e2 = this.options;
  e2.raw && e2.windowBits > 0 ? e2.windowBits = -e2.windowBits : e2.gzip && e2.windowBits > 0 && e2.windowBits < 16 && (e2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new Yt(), this.strm.avail_out = 0;
  let i2 = $t.deflateInit2(this.strm, e2.level, e2.method, e2.windowBits, e2.memLevel, e2.strategy);
  if (i2 !== re) throw new Error(H[i2]);
  if (e2.header && $t.deflateSetHeader(this.strm, e2.header), e2.dictionary) {
    let t3;
    if (t3 = "string" == typeof e2.dictionary ? Jt(e2.dictionary) : "[object ArrayBuffer]" === Qt.call(e2.dictionary) ? new Uint8Array(e2.dictionary) : e2.dictionary, i2 = $t.deflateSetDictionary(this.strm, t3), i2 !== re) throw new Error(H[i2]);
    this._dict_set = true;
  }
}
function he(t2, e2) {
  const i2 = new le(e2);
  if (i2.push(t2, true), i2.err) throw i2.msg || H[i2.err];
  return i2.result;
}
le.prototype.push = function(t2, e2) {
  const i2 = this.strm, r2 = this.options.chunkSize;
  let n2, s2;
  if (this.ended) return false;
  for (s2 = e2 === ~~e2 ? e2 : true === e2 ? ie : Vt, "string" == typeof t2 ? i2.input = Jt(t2) : "[object ArrayBuffer]" === Qt.call(t2) ? i2.input = new Uint8Array(t2) : i2.input = t2, i2.next_in = 0, i2.avail_in = i2.input.length; ; ) if (0 === i2.avail_out && (i2.output = new Uint8Array(r2), i2.next_out = 0, i2.avail_out = r2), (s2 === te || s2 === ee) && i2.avail_out <= 6) this.onData(i2.output.subarray(0, i2.next_out)), i2.avail_out = 0;
  else {
    if (n2 = $t.deflate(i2, s2), n2 === ne) return i2.next_out > 0 && this.onData(i2.output.subarray(0, i2.next_out)), n2 = $t.deflateEnd(this.strm), this.onEnd(n2), this.ended = true, n2 === re;
    if (0 !== i2.avail_out) {
      if (s2 > 0 && i2.next_out > 0) this.onData(i2.output.subarray(0, i2.next_out)), i2.avail_out = 0;
      else if (0 === i2.avail_in) break;
    } else this.onData(i2.output);
  }
  return true;
}, le.prototype.onData = function(t2) {
  this.chunks.push(t2);
}, le.prototype.onEnd = function(t2) {
  t2 === re && (this.result = Wt(this.chunks)), this.chunks = [], this.err = t2, this.msg = this.strm.msg;
};
var de = { Deflate: le, deflate: he, deflateRaw: function(t2, e2) {
  return (e2 = e2 || {}).raw = true, he(t2, e2);
}, gzip: function(t2, e2) {
  return (e2 = e2 || {}).gzip = true, he(t2, e2);
} };
const ue = 16209;
var fe = function(t2, e2) {
  let i2, r2, n2, s2, a2, o2, l2, h2, d2, u2, f2, c2, _2, w2, p2, m2, g2, y2, b2, v2, k2, x2, z2, A2;
  const S2 = t2.state;
  i2 = t2.next_in, z2 = t2.input, r2 = i2 + (t2.avail_in - 5), n2 = t2.next_out, A2 = t2.output, s2 = n2 - (e2 - t2.avail_out), a2 = n2 + (t2.avail_out - 257), o2 = S2.dmax, l2 = S2.wsize, h2 = S2.whave, d2 = S2.wnext, u2 = S2.window, f2 = S2.hold, c2 = S2.bits, _2 = S2.lencode, w2 = S2.distcode, p2 = (1 << S2.lenbits) - 1, m2 = (1 << S2.distbits) - 1;
  t: do {
    c2 < 15 && (f2 += z2[i2++] << c2, c2 += 8, f2 += z2[i2++] << c2, c2 += 8), g2 = _2[f2 & p2];
    e: for (; ; ) {
      if (y2 = g2 >>> 24, f2 >>>= y2, c2 -= y2, y2 = g2 >>> 16 & 255, 0 === y2) A2[n2++] = 65535 & g2;
      else {
        if (!(16 & y2)) {
          if (64 & y2) {
            if (32 & y2) {
              S2.mode = 16191;
              break t;
            }
            t2.msg = "invalid literal/length code", S2.mode = ue;
            break t;
          }
          g2 = _2[(65535 & g2) + (f2 & (1 << y2) - 1)];
          continue e;
        }
        for (b2 = 65535 & g2, y2 &= 15, y2 && (c2 < y2 && (f2 += z2[i2++] << c2, c2 += 8), b2 += f2 & (1 << y2) - 1, f2 >>>= y2, c2 -= y2), c2 < 15 && (f2 += z2[i2++] << c2, c2 += 8, f2 += z2[i2++] << c2, c2 += 8), g2 = w2[f2 & m2]; ; ) {
          if (y2 = g2 >>> 24, f2 >>>= y2, c2 -= y2, y2 = g2 >>> 16 & 255, 16 & y2) {
            if (v2 = 65535 & g2, y2 &= 15, c2 < y2 && (f2 += z2[i2++] << c2, c2 += 8, c2 < y2 && (f2 += z2[i2++] << c2, c2 += 8)), v2 += f2 & (1 << y2) - 1, v2 > o2) {
              t2.msg = "invalid distance too far back", S2.mode = ue;
              break t;
            }
            if (f2 >>>= y2, c2 -= y2, y2 = n2 - s2, v2 > y2) {
              if (y2 = v2 - y2, y2 > h2 && S2.sane) {
                t2.msg = "invalid distance too far back", S2.mode = ue;
                break t;
              }
              if (k2 = 0, x2 = u2, 0 === d2) {
                if (k2 += l2 - y2, y2 < b2) {
                  b2 -= y2;
                  do {
                    A2[n2++] = u2[k2++];
                  } while (--y2);
                  k2 = n2 - v2, x2 = A2;
                }
              } else if (d2 < y2) {
                if (k2 += l2 + d2 - y2, y2 -= d2, y2 < b2) {
                  b2 -= y2;
                  do {
                    A2[n2++] = u2[k2++];
                  } while (--y2);
                  if (k2 = 0, d2 < b2) {
                    y2 = d2, b2 -= y2;
                    do {
                      A2[n2++] = u2[k2++];
                    } while (--y2);
                    k2 = n2 - v2, x2 = A2;
                  }
                }
              } else if (k2 += d2 - y2, y2 < b2) {
                b2 -= y2;
                do {
                  A2[n2++] = u2[k2++];
                } while (--y2);
                k2 = n2 - v2, x2 = A2;
              }
              for (; b2 > 2; ) A2[n2++] = x2[k2++], A2[n2++] = x2[k2++], A2[n2++] = x2[k2++], b2 -= 3;
              b2 && (A2[n2++] = x2[k2++], b2 > 1 && (A2[n2++] = x2[k2++]));
            } else {
              k2 = n2 - v2;
              do {
                A2[n2++] = A2[k2++], A2[n2++] = A2[k2++], A2[n2++] = A2[k2++], b2 -= 3;
              } while (b2 > 2);
              b2 && (A2[n2++] = A2[k2++], b2 > 1 && (A2[n2++] = A2[k2++]));
            }
            break;
          }
          if (64 & y2) {
            t2.msg = "invalid distance code", S2.mode = ue;
            break t;
          }
          g2 = w2[(65535 & g2) + (f2 & (1 << y2) - 1)];
        }
      }
      break;
    }
  } while (i2 < r2 && n2 < a2);
  b2 = c2 >> 3, i2 -= b2, c2 -= b2 << 3, f2 &= (1 << c2) - 1, t2.next_in = i2, t2.next_out = n2, t2.avail_in = i2 < r2 ? r2 - i2 + 5 : 5 - (i2 - r2), t2.avail_out = n2 < a2 ? a2 - n2 + 257 : 257 - (n2 - a2), S2.hold = f2, S2.bits = c2;
};
const ce = 15, _e = new Uint16Array([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0]), we = new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78]), pe = new Uint16Array([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0]), me = new Uint8Array([16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64]);
var ge = (t2, e2, i2, r2, n2, s2, a2, o2) => {
  const l2 = o2.bits;
  let h2, d2, u2, f2, c2, _2, w2 = 0, p2 = 0, m2 = 0, g2 = 0, y2 = 0, b2 = 0, v2 = 0, k2 = 0, x2 = 0, z2 = 0, A2 = null;
  const S2 = new Uint16Array(16), T2 = new Uint16Array(16);
  let F2, I2, E2, C2 = null;
  for (w2 = 0; w2 <= ce; w2++) S2[w2] = 0;
  for (p2 = 0; p2 < r2; p2++) S2[e2[i2 + p2]]++;
  for (y2 = l2, g2 = ce; g2 >= 1 && 0 === S2[g2]; g2--) ;
  if (y2 > g2 && (y2 = g2), 0 === g2) return n2[s2++] = 20971520, n2[s2++] = 20971520, o2.bits = 1, 0;
  for (m2 = 1; m2 < g2 && 0 === S2[m2]; m2++) ;
  for (y2 < m2 && (y2 = m2), k2 = 1, w2 = 1; w2 <= ce; w2++) if (k2 <<= 1, k2 -= S2[w2], k2 < 0) return -1;
  if (k2 > 0 && (0 === t2 || 1 !== g2)) return -1;
  for (T2[1] = 0, w2 = 1; w2 < ce; w2++) T2[w2 + 1] = T2[w2] + S2[w2];
  for (p2 = 0; p2 < r2; p2++) 0 !== e2[i2 + p2] && (a2[T2[e2[i2 + p2]]++] = p2);
  if (0 === t2 ? (A2 = C2 = a2, _2 = 20) : 1 === t2 ? (A2 = _e, C2 = we, _2 = 257) : (A2 = pe, C2 = me, _2 = 0), z2 = 0, p2 = 0, w2 = m2, c2 = s2, b2 = y2, v2 = 0, u2 = -1, x2 = 1 << y2, f2 = x2 - 1, 1 === t2 && x2 > 852 || 2 === t2 && x2 > 592) return 1;
  for (; ; ) {
    F2 = w2 - v2, a2[p2] + 1 < _2 ? (I2 = 0, E2 = a2[p2]) : a2[p2] >= _2 ? (I2 = C2[a2[p2] - _2], E2 = A2[a2[p2] - _2]) : (I2 = 96, E2 = 0), h2 = 1 << w2 - v2, d2 = 1 << b2, m2 = d2;
    do {
      d2 -= h2, n2[c2 + (z2 >> v2) + d2] = F2 << 24 | I2 << 16 | E2;
    } while (0 !== d2);
    for (h2 = 1 << w2 - 1; z2 & h2; ) h2 >>= 1;
    if (0 !== h2 ? (z2 &= h2 - 1, z2 += h2) : z2 = 0, p2++, 0 === --S2[w2]) {
      if (w2 === g2) break;
      w2 = e2[i2 + a2[p2]];
    }
    if (w2 > y2 && (z2 & f2) !== u2) {
      for (0 === v2 && (v2 = y2), c2 += m2, b2 = w2 - v2, k2 = 1 << b2; b2 + v2 < g2 && (k2 -= S2[b2 + v2], !(k2 <= 0)); ) b2++, k2 <<= 1;
      if (x2 += 1 << b2, 1 === t2 && x2 > 852 || 2 === t2 && x2 > 592) return 1;
      u2 = z2 & f2, n2[u2] = y2 << 24 | b2 << 16 | c2 - s2;
    }
  }
  return 0 !== z2 && (n2[c2 + z2] = w2 - v2 << 24 | 64 << 16), o2.bits = y2, 0;
};
const { Z_FINISH: ye, Z_BLOCK: be, Z_TREES: ve, Z_OK: ke, Z_STREAM_END: xe, Z_NEED_DICT: ze, Z_STREAM_ERROR: Ae, Z_DATA_ERROR: Se, Z_MEM_ERROR: Te, Z_BUF_ERROR: Fe, Z_DEFLATED: Ie } = W, Ee = 16180, Ce = 16190, Be = 16191, De = 16192, Re = 16194, Ue = 16199, Ne = 16200, Le = 16206, Pe = 16209, Oe = (t2) => (t2 >>> 24 & 255) + (t2 >>> 8 & 65280) + ((65280 & t2) << 8) + ((255 & t2) << 24);
function Ze() {
  this.strm = null, this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new Uint16Array(320), this.work = new Uint16Array(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
}
const Me = (t2) => {
  if (!t2) return 1;
  const e2 = t2.state;
  return !e2 || e2.strm !== t2 || e2.mode < Ee || e2.mode > 16211 ? 1 : 0;
}, $e = (t2) => {
  if (Me(t2)) return Ae;
  const e2 = t2.state;
  return t2.total_in = t2.total_out = e2.total = 0, t2.msg = "", e2.wrap && (t2.adler = 1 & e2.wrap), e2.mode = Ee, e2.last = 0, e2.havedict = 0, e2.flags = -1, e2.dmax = 32768, e2.head = null, e2.hold = 0, e2.bits = 0, e2.lencode = e2.lendyn = new Int32Array(852), e2.distcode = e2.distdyn = new Int32Array(592), e2.sane = 1, e2.back = -1, ke;
}, je = (t2) => {
  if (Me(t2)) return Ae;
  const e2 = t2.state;
  return e2.wsize = 0, e2.whave = 0, e2.wnext = 0, $e(t2);
}, He = (t2, e2) => {
  let i2;
  if (Me(t2)) return Ae;
  const r2 = t2.state;
  return e2 < 0 ? (i2 = 0, e2 = -e2) : (i2 = 5 + (e2 >> 4), e2 < 48 && (e2 &= 15)), e2 && (e2 < 8 || e2 > 15) ? Ae : (null !== r2.window && r2.wbits !== e2 && (r2.window = null), r2.wrap = i2, r2.wbits = e2, je(t2));
}, We = (t2, e2) => {
  if (!t2) return Ae;
  const i2 = new Ze();
  t2.state = i2, i2.strm = t2, i2.window = null, i2.mode = Ee;
  const r2 = He(t2, e2);
  return r2 !== ke && (t2.state = null), r2;
};
let qe, Ke, Je = true;
const Xe = (t2) => {
  if (Je) {
    qe = new Int32Array(512), Ke = new Int32Array(32);
    let e2 = 0;
    for (; e2 < 144; ) t2.lens[e2++] = 8;
    for (; e2 < 256; ) t2.lens[e2++] = 9;
    for (; e2 < 280; ) t2.lens[e2++] = 7;
    for (; e2 < 288; ) t2.lens[e2++] = 8;
    for (ge(1, t2.lens, 0, 288, qe, 0, t2.work, { bits: 9 }), e2 = 0; e2 < 32; ) t2.lens[e2++] = 5;
    ge(2, t2.lens, 0, 32, Ke, 0, t2.work, { bits: 5 }), Je = false;
  }
  t2.lencode = qe, t2.lenbits = 9, t2.distcode = Ke, t2.distbits = 5;
}, Ge = (t2, e2, i2, r2) => {
  let n2;
  const s2 = t2.state;
  return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new Uint8Array(s2.wsize)), r2 >= s2.wsize ? (s2.window.set(e2.subarray(i2 - s2.wsize, i2), 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 = s2.wsize - s2.wnext, n2 > r2 && (n2 = r2), s2.window.set(e2.subarray(i2 - r2, i2 - r2 + n2), s2.wnext), (r2 -= n2) ? (s2.window.set(e2.subarray(i2 - r2, i2), 0), s2.wnext = r2, s2.whave = s2.wsize) : (s2.wnext += n2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += n2))), 0;
};
var Ye = { inflateReset: je, inflateReset2: He, inflateResetKeep: $e, inflateInit: (t2) => We(t2, 15), inflateInit2: We, inflate: (t2, e2) => {
  let i2, r2, n2, s2, a2, o2, l2, h2, d2, u2, f2, c2, _2, w2, p2, m2, g2, y2, b2, v2, k2, x2, z2 = 0;
  const A2 = new Uint8Array(4);
  let S2, T2;
  const F2 = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
  if (Me(t2) || !t2.output || !t2.input && 0 !== t2.avail_in) return Ae;
  i2 = t2.state, i2.mode === Be && (i2.mode = De), a2 = t2.next_out, n2 = t2.output, l2 = t2.avail_out, s2 = t2.next_in, r2 = t2.input, o2 = t2.avail_in, h2 = i2.hold, d2 = i2.bits, u2 = o2, f2 = l2, x2 = ke;
  t: for (; ; ) switch (i2.mode) {
    case Ee:
      if (0 === i2.wrap) {
        i2.mode = De;
        break;
      }
      for (; d2 < 16; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if (2 & i2.wrap && 35615 === h2) {
        0 === i2.wbits && (i2.wbits = 15), i2.check = 0, A2[0] = 255 & h2, A2[1] = h2 >>> 8 & 255, i2.check = j(i2.check, A2, 2, 0), h2 = 0, d2 = 0, i2.mode = 16181;
        break;
      }
      if (i2.head && (i2.head.done = false), !(1 & i2.wrap) || (((255 & h2) << 8) + (h2 >> 8)) % 31) {
        t2.msg = "incorrect header check", i2.mode = Pe;
        break;
      }
      if ((15 & h2) !== Ie) {
        t2.msg = "unknown compression method", i2.mode = Pe;
        break;
      }
      if (h2 >>>= 4, d2 -= 4, k2 = 8 + (15 & h2), 0 === i2.wbits && (i2.wbits = k2), k2 > 15 || k2 > i2.wbits) {
        t2.msg = "invalid window size", i2.mode = Pe;
        break;
      }
      i2.dmax = 1 << i2.wbits, i2.flags = 0, t2.adler = i2.check = 1, i2.mode = 512 & h2 ? 16189 : Be, h2 = 0, d2 = 0;
      break;
    case 16181:
      for (; d2 < 16; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if (i2.flags = h2, (255 & i2.flags) !== Ie) {
        t2.msg = "unknown compression method", i2.mode = Pe;
        break;
      }
      if (57344 & i2.flags) {
        t2.msg = "unknown header flags set", i2.mode = Pe;
        break;
      }
      i2.head && (i2.head.text = h2 >> 8 & 1), 512 & i2.flags && 4 & i2.wrap && (A2[0] = 255 & h2, A2[1] = h2 >>> 8 & 255, i2.check = j(i2.check, A2, 2, 0)), h2 = 0, d2 = 0, i2.mode = 16182;
    case 16182:
      for (; d2 < 32; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      i2.head && (i2.head.time = h2), 512 & i2.flags && 4 & i2.wrap && (A2[0] = 255 & h2, A2[1] = h2 >>> 8 & 255, A2[2] = h2 >>> 16 & 255, A2[3] = h2 >>> 24 & 255, i2.check = j(i2.check, A2, 4, 0)), h2 = 0, d2 = 0, i2.mode = 16183;
    case 16183:
      for (; d2 < 16; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      i2.head && (i2.head.xflags = 255 & h2, i2.head.os = h2 >> 8), 512 & i2.flags && 4 & i2.wrap && (A2[0] = 255 & h2, A2[1] = h2 >>> 8 & 255, i2.check = j(i2.check, A2, 2, 0)), h2 = 0, d2 = 0, i2.mode = 16184;
    case 16184:
      if (1024 & i2.flags) {
        for (; d2 < 16; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        i2.length = h2, i2.head && (i2.head.extra_len = h2), 512 & i2.flags && 4 & i2.wrap && (A2[0] = 255 & h2, A2[1] = h2 >>> 8 & 255, i2.check = j(i2.check, A2, 2, 0)), h2 = 0, d2 = 0;
      } else i2.head && (i2.head.extra = null);
      i2.mode = 16185;
    case 16185:
      if (1024 & i2.flags && (c2 = i2.length, c2 > o2 && (c2 = o2), c2 && (i2.head && (k2 = i2.head.extra_len - i2.length, i2.head.extra || (i2.head.extra = new Uint8Array(i2.head.extra_len)), i2.head.extra.set(r2.subarray(s2, s2 + c2), k2)), 512 & i2.flags && 4 & i2.wrap && (i2.check = j(i2.check, r2, c2, s2)), o2 -= c2, s2 += c2, i2.length -= c2), i2.length)) break t;
      i2.length = 0, i2.mode = 16186;
    case 16186:
      if (2048 & i2.flags) {
        if (0 === o2) break t;
        c2 = 0;
        do {
          k2 = r2[s2 + c2++], i2.head && k2 && i2.length < 65536 && (i2.head.name += String.fromCharCode(k2));
        } while (k2 && c2 < o2);
        if (512 & i2.flags && 4 & i2.wrap && (i2.check = j(i2.check, r2, c2, s2)), o2 -= c2, s2 += c2, k2) break t;
      } else i2.head && (i2.head.name = null);
      i2.length = 0, i2.mode = 16187;
    case 16187:
      if (4096 & i2.flags) {
        if (0 === o2) break t;
        c2 = 0;
        do {
          k2 = r2[s2 + c2++], i2.head && k2 && i2.length < 65536 && (i2.head.comment += String.fromCharCode(k2));
        } while (k2 && c2 < o2);
        if (512 & i2.flags && 4 & i2.wrap && (i2.check = j(i2.check, r2, c2, s2)), o2 -= c2, s2 += c2, k2) break t;
      } else i2.head && (i2.head.comment = null);
      i2.mode = 16188;
    case 16188:
      if (512 & i2.flags) {
        for (; d2 < 16; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        if (4 & i2.wrap && h2 !== (65535 & i2.check)) {
          t2.msg = "header crc mismatch", i2.mode = Pe;
          break;
        }
        h2 = 0, d2 = 0;
      }
      i2.head && (i2.head.hcrc = i2.flags >> 9 & 1, i2.head.done = true), t2.adler = i2.check = 0, i2.mode = Be;
      break;
    case 16189:
      for (; d2 < 32; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      t2.adler = i2.check = Oe(h2), h2 = 0, d2 = 0, i2.mode = Ce;
    case Ce:
      if (0 === i2.havedict) return t2.next_out = a2, t2.avail_out = l2, t2.next_in = s2, t2.avail_in = o2, i2.hold = h2, i2.bits = d2, ze;
      t2.adler = i2.check = 1, i2.mode = Be;
    case Be:
      if (e2 === be || e2 === ve) break t;
    case De:
      if (i2.last) {
        h2 >>>= 7 & d2, d2 -= 7 & d2, i2.mode = Le;
        break;
      }
      for (; d2 < 3; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      switch (i2.last = 1 & h2, h2 >>>= 1, d2 -= 1, 3 & h2) {
        case 0:
          i2.mode = 16193;
          break;
        case 1:
          if (Xe(i2), i2.mode = Ue, e2 === ve) {
            h2 >>>= 2, d2 -= 2;
            break t;
          }
          break;
        case 2:
          i2.mode = 16196;
          break;
        case 3:
          t2.msg = "invalid block type", i2.mode = Pe;
      }
      h2 >>>= 2, d2 -= 2;
      break;
    case 16193:
      for (h2 >>>= 7 & d2, d2 -= 7 & d2; d2 < 32; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if ((65535 & h2) != (h2 >>> 16 ^ 65535)) {
        t2.msg = "invalid stored block lengths", i2.mode = Pe;
        break;
      }
      if (i2.length = 65535 & h2, h2 = 0, d2 = 0, i2.mode = Re, e2 === ve) break t;
    case Re:
      i2.mode = 16195;
    case 16195:
      if (c2 = i2.length, c2) {
        if (c2 > o2 && (c2 = o2), c2 > l2 && (c2 = l2), 0 === c2) break t;
        n2.set(r2.subarray(s2, s2 + c2), a2), o2 -= c2, s2 += c2, l2 -= c2, a2 += c2, i2.length -= c2;
        break;
      }
      i2.mode = Be;
      break;
    case 16196:
      for (; d2 < 14; ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if (i2.nlen = 257 + (31 & h2), h2 >>>= 5, d2 -= 5, i2.ndist = 1 + (31 & h2), h2 >>>= 5, d2 -= 5, i2.ncode = 4 + (15 & h2), h2 >>>= 4, d2 -= 4, i2.nlen > 286 || i2.ndist > 30) {
        t2.msg = "too many length or distance symbols", i2.mode = Pe;
        break;
      }
      i2.have = 0, i2.mode = 16197;
    case 16197:
      for (; i2.have < i2.ncode; ) {
        for (; d2 < 3; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        i2.lens[F2[i2.have++]] = 7 & h2, h2 >>>= 3, d2 -= 3;
      }
      for (; i2.have < 19; ) i2.lens[F2[i2.have++]] = 0;
      if (i2.lencode = i2.lendyn, i2.lenbits = 7, S2 = { bits: i2.lenbits }, x2 = ge(0, i2.lens, 0, 19, i2.lencode, 0, i2.work, S2), i2.lenbits = S2.bits, x2) {
        t2.msg = "invalid code lengths set", i2.mode = Pe;
        break;
      }
      i2.have = 0, i2.mode = 16198;
    case 16198:
      for (; i2.have < i2.nlen + i2.ndist; ) {
        for (; z2 = i2.lencode[h2 & (1 << i2.lenbits) - 1], p2 = z2 >>> 24, m2 = z2 >>> 16 & 255, g2 = 65535 & z2, !(p2 <= d2); ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        if (g2 < 16) h2 >>>= p2, d2 -= p2, i2.lens[i2.have++] = g2;
        else {
          if (16 === g2) {
            for (T2 = p2 + 2; d2 < T2; ) {
              if (0 === o2) break t;
              o2--, h2 += r2[s2++] << d2, d2 += 8;
            }
            if (h2 >>>= p2, d2 -= p2, 0 === i2.have) {
              t2.msg = "invalid bit length repeat", i2.mode = Pe;
              break;
            }
            k2 = i2.lens[i2.have - 1], c2 = 3 + (3 & h2), h2 >>>= 2, d2 -= 2;
          } else if (17 === g2) {
            for (T2 = p2 + 3; d2 < T2; ) {
              if (0 === o2) break t;
              o2--, h2 += r2[s2++] << d2, d2 += 8;
            }
            h2 >>>= p2, d2 -= p2, k2 = 0, c2 = 3 + (7 & h2), h2 >>>= 3, d2 -= 3;
          } else {
            for (T2 = p2 + 7; d2 < T2; ) {
              if (0 === o2) break t;
              o2--, h2 += r2[s2++] << d2, d2 += 8;
            }
            h2 >>>= p2, d2 -= p2, k2 = 0, c2 = 11 + (127 & h2), h2 >>>= 7, d2 -= 7;
          }
          if (i2.have + c2 > i2.nlen + i2.ndist) {
            t2.msg = "invalid bit length repeat", i2.mode = Pe;
            break;
          }
          for (; c2--; ) i2.lens[i2.have++] = k2;
        }
      }
      if (i2.mode === Pe) break;
      if (0 === i2.lens[256]) {
        t2.msg = "invalid code -- missing end-of-block", i2.mode = Pe;
        break;
      }
      if (i2.lenbits = 9, S2 = { bits: i2.lenbits }, x2 = ge(1, i2.lens, 0, i2.nlen, i2.lencode, 0, i2.work, S2), i2.lenbits = S2.bits, x2) {
        t2.msg = "invalid literal/lengths set", i2.mode = Pe;
        break;
      }
      if (i2.distbits = 6, i2.distcode = i2.distdyn, S2 = { bits: i2.distbits }, x2 = ge(2, i2.lens, i2.nlen, i2.ndist, i2.distcode, 0, i2.work, S2), i2.distbits = S2.bits, x2) {
        t2.msg = "invalid distances set", i2.mode = Pe;
        break;
      }
      if (i2.mode = Ue, e2 === ve) break t;
    case Ue:
      i2.mode = Ne;
    case Ne:
      if (o2 >= 6 && l2 >= 258) {
        t2.next_out = a2, t2.avail_out = l2, t2.next_in = s2, t2.avail_in = o2, i2.hold = h2, i2.bits = d2, fe(t2, f2), a2 = t2.next_out, n2 = t2.output, l2 = t2.avail_out, s2 = t2.next_in, r2 = t2.input, o2 = t2.avail_in, h2 = i2.hold, d2 = i2.bits, i2.mode === Be && (i2.back = -1);
        break;
      }
      for (i2.back = 0; z2 = i2.lencode[h2 & (1 << i2.lenbits) - 1], p2 = z2 >>> 24, m2 = z2 >>> 16 & 255, g2 = 65535 & z2, !(p2 <= d2); ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if (m2 && !(240 & m2)) {
        for (y2 = p2, b2 = m2, v2 = g2; z2 = i2.lencode[v2 + ((h2 & (1 << y2 + b2) - 1) >> y2)], p2 = z2 >>> 24, m2 = z2 >>> 16 & 255, g2 = 65535 & z2, !(y2 + p2 <= d2); ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        h2 >>>= y2, d2 -= y2, i2.back += y2;
      }
      if (h2 >>>= p2, d2 -= p2, i2.back += p2, i2.length = g2, 0 === m2) {
        i2.mode = 16205;
        break;
      }
      if (32 & m2) {
        i2.back = -1, i2.mode = Be;
        break;
      }
      if (64 & m2) {
        t2.msg = "invalid literal/length code", i2.mode = Pe;
        break;
      }
      i2.extra = 15 & m2, i2.mode = 16201;
    case 16201:
      if (i2.extra) {
        for (T2 = i2.extra; d2 < T2; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        i2.length += h2 & (1 << i2.extra) - 1, h2 >>>= i2.extra, d2 -= i2.extra, i2.back += i2.extra;
      }
      i2.was = i2.length, i2.mode = 16202;
    case 16202:
      for (; z2 = i2.distcode[h2 & (1 << i2.distbits) - 1], p2 = z2 >>> 24, m2 = z2 >>> 16 & 255, g2 = 65535 & z2, !(p2 <= d2); ) {
        if (0 === o2) break t;
        o2--, h2 += r2[s2++] << d2, d2 += 8;
      }
      if (!(240 & m2)) {
        for (y2 = p2, b2 = m2, v2 = g2; z2 = i2.distcode[v2 + ((h2 & (1 << y2 + b2) - 1) >> y2)], p2 = z2 >>> 24, m2 = z2 >>> 16 & 255, g2 = 65535 & z2, !(y2 + p2 <= d2); ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        h2 >>>= y2, d2 -= y2, i2.back += y2;
      }
      if (h2 >>>= p2, d2 -= p2, i2.back += p2, 64 & m2) {
        t2.msg = "invalid distance code", i2.mode = Pe;
        break;
      }
      i2.offset = g2, i2.extra = 15 & m2, i2.mode = 16203;
    case 16203:
      if (i2.extra) {
        for (T2 = i2.extra; d2 < T2; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        i2.offset += h2 & (1 << i2.extra) - 1, h2 >>>= i2.extra, d2 -= i2.extra, i2.back += i2.extra;
      }
      if (i2.offset > i2.dmax) {
        t2.msg = "invalid distance too far back", i2.mode = Pe;
        break;
      }
      i2.mode = 16204;
    case 16204:
      if (0 === l2) break t;
      if (c2 = f2 - l2, i2.offset > c2) {
        if (c2 = i2.offset - c2, c2 > i2.whave && i2.sane) {
          t2.msg = "invalid distance too far back", i2.mode = Pe;
          break;
        }
        c2 > i2.wnext ? (c2 -= i2.wnext, _2 = i2.wsize - c2) : _2 = i2.wnext - c2, c2 > i2.length && (c2 = i2.length), w2 = i2.window;
      } else w2 = n2, _2 = a2 - i2.offset, c2 = i2.length;
      c2 > l2 && (c2 = l2), l2 -= c2, i2.length -= c2;
      do {
        n2[a2++] = w2[_2++];
      } while (--c2);
      0 === i2.length && (i2.mode = Ne);
      break;
    case 16205:
      if (0 === l2) break t;
      n2[a2++] = i2.length, l2--, i2.mode = Ne;
      break;
    case Le:
      if (i2.wrap) {
        for (; d2 < 32; ) {
          if (0 === o2) break t;
          o2--, h2 |= r2[s2++] << d2, d2 += 8;
        }
        if (f2 -= l2, t2.total_out += f2, i2.total += f2, 4 & i2.wrap && f2 && (t2.adler = i2.check = i2.flags ? j(i2.check, n2, f2, a2 - f2) : M(i2.check, n2, f2, a2 - f2)), f2 = l2, 4 & i2.wrap && (i2.flags ? h2 : Oe(h2)) !== i2.check) {
          t2.msg = "incorrect data check", i2.mode = Pe;
          break;
        }
        h2 = 0, d2 = 0;
      }
      i2.mode = 16207;
    case 16207:
      if (i2.wrap && i2.flags) {
        for (; d2 < 32; ) {
          if (0 === o2) break t;
          o2--, h2 += r2[s2++] << d2, d2 += 8;
        }
        if (4 & i2.wrap && h2 !== (4294967295 & i2.total)) {
          t2.msg = "incorrect length check", i2.mode = Pe;
          break;
        }
        h2 = 0, d2 = 0;
      }
      i2.mode = 16208;
    case 16208:
      x2 = xe;
      break t;
    case Pe:
      x2 = Se;
      break t;
    case 16210:
      return Te;
    default:
      return Ae;
  }
  return t2.next_out = a2, t2.avail_out = l2, t2.next_in = s2, t2.avail_in = o2, i2.hold = h2, i2.bits = d2, (i2.wsize || f2 !== t2.avail_out && i2.mode < Pe && (i2.mode < Le || e2 !== ye)) && Ge(t2, t2.output, t2.next_out, f2 - t2.avail_out), u2 -= t2.avail_in, f2 -= t2.avail_out, t2.total_in += u2, t2.total_out += f2, i2.total += f2, 4 & i2.wrap && f2 && (t2.adler = i2.check = i2.flags ? j(i2.check, n2, f2, t2.next_out - f2) : M(i2.check, n2, f2, t2.next_out - f2)), t2.data_type = i2.bits + (i2.last ? 64 : 0) + (i2.mode === Be ? 128 : 0) + (i2.mode === Ue || i2.mode === Re ? 256 : 0), (0 === u2 && 0 === f2 || e2 === ye) && x2 === ke && (x2 = Fe), x2;
}, inflateEnd: (t2) => {
  if (Me(t2)) return Ae;
  let e2 = t2.state;
  return e2.window && (e2.window = null), t2.state = null, ke;
}, inflateGetHeader: (t2, e2) => {
  if (Me(t2)) return Ae;
  const i2 = t2.state;
  return 2 & i2.wrap ? (i2.head = e2, e2.done = false, ke) : Ae;
}, inflateSetDictionary: (t2, e2) => {
  const i2 = e2.length;
  let r2, n2, s2;
  return Me(t2) ? Ae : (r2 = t2.state, 0 !== r2.wrap && r2.mode !== Ce ? Ae : r2.mode === Ce && (n2 = 1, n2 = M(n2, e2, i2, 0), n2 !== r2.check) ? Se : (s2 = Ge(t2, e2, i2, i2), s2 ? (r2.mode = 16210, Te) : (r2.havedict = 1, ke)));
}, inflateInfo: "pako inflate (from Nodeca project)" };
var Qe = function() {
  this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
};
const Ve = Object.prototype.toString, { Z_NO_FLUSH: ti, Z_FINISH: ei, Z_OK: ii, Z_STREAM_END: ri, Z_NEED_DICT: ni, Z_STREAM_ERROR: si, Z_DATA_ERROR: ai, Z_MEM_ERROR: oi } = W;
function li(t2) {
  this.options = Ht({ chunkSize: 65536, windowBits: 15, to: "" }, t2 || {});
  const e2 = this.options;
  e2.raw && e2.windowBits >= 0 && e2.windowBits < 16 && (e2.windowBits = -e2.windowBits, 0 === e2.windowBits && (e2.windowBits = -15)), !(e2.windowBits >= 0 && e2.windowBits < 16) || t2 && t2.windowBits || (e2.windowBits += 32), e2.windowBits > 15 && e2.windowBits < 48 && (15 & e2.windowBits || (e2.windowBits |= 15)), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new Yt(), this.strm.avail_out = 0;
  let i2 = Ye.inflateInit2(this.strm, e2.windowBits);
  if (i2 !== ii) throw new Error(H[i2]);
  if (this.header = new Qe(), Ye.inflateGetHeader(this.strm, this.header), e2.dictionary && ("string" == typeof e2.dictionary ? e2.dictionary = Jt(e2.dictionary) : "[object ArrayBuffer]" === Ve.call(e2.dictionary) && (e2.dictionary = new Uint8Array(e2.dictionary)), e2.raw && (i2 = Ye.inflateSetDictionary(this.strm, e2.dictionary), i2 !== ii))) throw new Error(H[i2]);
}
function hi(t2, e2) {
  const i2 = new li(e2);
  if (i2.push(t2), i2.err) throw i2.msg || H[i2.err];
  return i2.result;
}
li.prototype.push = function(t2, e2) {
  const i2 = this.strm, r2 = this.options.chunkSize, n2 = this.options.dictionary;
  let s2, a2, o2;
  if (this.ended) return false;
  for (a2 = e2 === ~~e2 ? e2 : true === e2 ? ei : ti, "[object ArrayBuffer]" === Ve.call(t2) ? i2.input = new Uint8Array(t2) : i2.input = t2, i2.next_in = 0, i2.avail_in = i2.input.length; ; ) {
    for (0 === i2.avail_out && (i2.output = new Uint8Array(r2), i2.next_out = 0, i2.avail_out = r2), s2 = Ye.inflate(i2, a2), s2 === ni && n2 && (s2 = Ye.inflateSetDictionary(i2, n2), s2 === ii ? s2 = Ye.inflate(i2, a2) : s2 === ai && (s2 = ni)); i2.avail_in > 0 && s2 === ri && i2.state.wrap > 0 && 0 !== t2[i2.next_in]; ) Ye.inflateReset(i2), s2 = Ye.inflate(i2, a2);
    switch (s2) {
      case si:
      case ai:
      case ni:
      case oi:
        return this.onEnd(s2), this.ended = true, false;
    }
    if (o2 = i2.avail_out, i2.next_out && (0 === i2.avail_out || s2 === ri)) if ("string" === this.options.to) {
      let t3 = Gt(i2.output, i2.next_out), e3 = i2.next_out - t3, n3 = Xt(i2.output, t3);
      i2.next_out = e3, i2.avail_out = r2 - e3, e3 && i2.output.set(i2.output.subarray(t3, t3 + e3), 0), this.onData(n3);
    } else this.onData(i2.output.length === i2.next_out ? i2.output : i2.output.subarray(0, i2.next_out));
    if (s2 !== ii || 0 !== o2) {
      if (s2 === ri) return s2 = Ye.inflateEnd(this.strm), this.onEnd(s2), this.ended = true, true;
      if (0 === i2.avail_in) break;
    }
  }
  return true;
}, li.prototype.onData = function(t2) {
  this.chunks.push(t2);
}, li.prototype.onEnd = function(t2) {
  t2 === ii && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = Wt(this.chunks)), this.chunks = [], this.err = t2, this.msg = this.strm.msg;
};
var di = { Inflate: li, inflate: hi, inflateRaw: function(t2, e2) {
  return (e2 = e2 || {}).raw = true, hi(t2, e2);
}, ungzip: hi };
const { Deflate: ui, deflate: fi, deflateRaw: ci, gzip: _i } = de, { Inflate: wi, inflate: pi, inflateRaw: mi, ungzip: gi } = di;
var yi, bi = { Deflate: ui, deflate: fi, deflateRaw: ci, gzip: _i, Inflate: wi, inflate: pi, inflateRaw: mi, ungzip: gi, constants: W }, vi = {};
var ki = (function() {
  if (yi) return vi;
  yi = 1, vi.byteLength = function(t3) {
    var e3 = s2(t3), i3 = e3[0], r3 = e3[1];
    return 3 * (i3 + r3) / 4 - r3;
  }, vi.toByteArray = function(t3) {
    var r3, n3, a3 = s2(t3), o3 = a3[0], l2 = a3[1], h2 = new i2((function(t4, e3, i3) {
      return 3 * (e3 + i3) / 4 - i3;
    })(0, o3, l2)), d2 = 0, u2 = l2 > 0 ? o3 - 4 : o3;
    for (n3 = 0; n3 < u2; n3 += 4) r3 = e2[t3.charCodeAt(n3)] << 18 | e2[t3.charCodeAt(n3 + 1)] << 12 | e2[t3.charCodeAt(n3 + 2)] << 6 | e2[t3.charCodeAt(n3 + 3)], h2[d2++] = r3 >> 16 & 255, h2[d2++] = r3 >> 8 & 255, h2[d2++] = 255 & r3;
    2 === l2 && (r3 = e2[t3.charCodeAt(n3)] << 2 | e2[t3.charCodeAt(n3 + 1)] >> 4, h2[d2++] = 255 & r3);
    1 === l2 && (r3 = e2[t3.charCodeAt(n3)] << 10 | e2[t3.charCodeAt(n3 + 1)] << 4 | e2[t3.charCodeAt(n3 + 2)] >> 2, h2[d2++] = r3 >> 8 & 255, h2[d2++] = 255 & r3);
    return h2;
  }, vi.fromByteArray = function(e3) {
    for (var i3, r3 = e3.length, n3 = r3 % 3, s3 = [], a3 = 16383, l2 = 0, h2 = r3 - n3; l2 < h2; l2 += a3) s3.push(o2(e3, l2, l2 + a3 > h2 ? h2 : l2 + a3));
    1 === n3 ? (i3 = e3[r3 - 1], s3.push(t2[i3 >> 2] + t2[i3 << 4 & 63] + "==")) : 2 === n3 && (i3 = (e3[r3 - 2] << 8) + e3[r3 - 1], s3.push(t2[i3 >> 10] + t2[i3 >> 4 & 63] + t2[i3 << 2 & 63] + "="));
    return s3.join("");
  };
  for (var t2 = [], e2 = [], i2 = "undefined" != typeof Uint8Array ? Uint8Array : Array, r2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n2 = 0; n2 < 64; ++n2) t2[n2] = r2[n2], e2[r2.charCodeAt(n2)] = n2;
  function s2(t3) {
    var e3 = t3.length;
    if (e3 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var i3 = t3.indexOf("=");
    return -1 === i3 && (i3 = e3), [i3, i3 === e3 ? 0 : 4 - i3 % 4];
  }
  function a2(e3) {
    return t2[e3 >> 18 & 63] + t2[e3 >> 12 & 63] + t2[e3 >> 6 & 63] + t2[63 & e3];
  }
  function o2(t3, e3, i3) {
    for (var r3, n3 = [], s3 = e3; s3 < i3; s3 += 3) r3 = (t3[s3] << 16 & 16711680) + (t3[s3 + 1] << 8 & 65280) + (255 & t3[s3 + 2]), n3.push(a2(r3));
    return n3.join("");
  }
  return e2["-".charCodeAt(0)] = 62, e2["_".charCodeAt(0)] = 63, vi;
})();
!(function() {
  try {
    return "win32" === process.platform;
  } catch (t2) {
    return false;
  }
})();
const xi = (function() {
  try {
    if ("fs" === require.resolve("fs")) return require("fs"), false;
  } catch (t2) {
  }
  return true;
})();
function zi(t2) {
  return Uint8Array.from(t2, (t3) => t3.charCodeAt(0));
}
function Ai(e2) {
  return t(this, arguments, void 0, function* (t2, e3 = "binary") {
    return "function" == typeof Buffer ? Buffer.from(t2).toString(e3) : new Promise((i2) => {
      const r2 = new FileReader();
      r2.onloadend = () => i2(r2.result);
      const n2 = t2;
      "binary" == e3 ? r2.readAsBinaryString(new Blob([n2])) : r2.readAsText(new Blob([n2]), e3);
    });
  });
}
const Si = "function" == typeof Buffer;
function Ti(t2) {
  const e2 = bi.deflate(t2);
  return Si ? Buffer.from(e2).toString("base64") : ki.fromByteArray(e2);
}
function Fi(t2) {
  let e2;
  return e2 = Si ? Buffer.from(t2, "base64") : ki.toByteArray(t2), bi.inflate(e2);
}
class Ii extends Error {
  constructor(t2, e2 = null, i2 = false) {
    if ("fail" === e2 || "FAIL" === e2 || "EXIT" === e2) try {
      t2 = new TextDecoder().decode(Fi(t2));
    } catch (e3) {
      t2 = `decode [${t2}] error: ${e3}`;
    }
    else e2 && (t2 = `[TrzszError] ${e2}: ${t2}`);
    super(t2), Object.setPrototypeOf(this, Ii.prototype), Error.captureStackTrace && Error.captureStackTrace(this, Ii), this.name = "TrzszError", this.type = e2, this.trace = i2;
  }
  isTraceBack() {
    return "fail" !== this.type && "EXIT" !== this.type && this.trace;
  }
  isRemoteExit() {
    return "EXIT" === this.type;
  }
  isRemoteFail() {
    return "fail" === this.type || "FAIL" === this.type;
  }
  isStopAndDelete() {
    return "fail" === this.type && "Stopped and deleted" === this.message;
  }
  static getErrorMessage(t2) {
    return t2 instanceof Ii && !t2.isTraceBack() ? t2.message : t2.stack ? t2.stack.replace("TrzszError: ", "") : t2.toString();
  }
}
function Ei(t2) {
  return 97 <= t2 && t2 <= 122 || 65 <= t2 && t2 <= 90;
}
const Ci = 1;
function Bi(t2, e2) {
  let i2 = `Saved ${t2.length} ${t2.length > 1 ? "files/directories" : "file/directory"}`;
  return e2.length > 0 && (i2 += ` to ${e2}`), [i2].concat(t2).join("\r\n- ");
}
const Di = Ui("fs"), Ri = Ui("path");
function Ui(t2) {
  try {
    return require(t2);
  } catch (t3) {
    return {};
  }
}
!(function(t2, e2) {
  for (const i2 of e2) t2[i2 + "Async"] = (...e3) => new Promise((r2) => {
    t2[i2](...e3, (t3) => r2(!t3));
  });
})(Di, ["rm", "rmdir", "unlink", "access"]), (function(t2, e2) {
  for (const i2 of e2) t2[i2 + "Async"] = (...e3) => new Promise((r2, n2) => {
    t2[i2](...e3, (t3, e4) => {
      t3 ? n2(t3) : r2(e4);
    });
  });
})(Di, ["stat", "mkdir", "readdir", "close", "open", "realpath", "write"]);
class Ni {
  constructor(t2, e2, i2, r2, n2) {
    this.closed = false, this.fd = null, this.pathId = t2, this.absPath = e2, this.relPath = i2, this.dir = r2, this.size = n2;
  }
  getPathId() {
    return this.pathId;
  }
  getRelPath() {
    return this.relPath;
  }
  isDir() {
    return this.dir;
  }
  getSize() {
    return this.size;
  }
  readFile(e2) {
    return t(this, void 0, void 0, function* () {
      if (this.closed) throw new Ii(`File closed: ${this.absPath}`, null, true);
      null === this.fd && (this.fd = yield Di.openAsync(this.absPath, "r"));
      const i2 = new Uint8Array(e2);
      return (function(e3, i3, r2, n2, s2) {
        return t(this, void 0, void 0, function* () {
          return new Promise((t2, a2) => Di.read(e3, i3, r2, n2, s2, (e4, i4, r3) => {
            e4 ? a2(e4) : t2(r3.subarray(0, i4));
          }));
        });
      })(this.fd, i2, 0, i2.length, null);
    });
  }
  closeFile() {
    return t(this, void 0, void 0, function* () {
      this.closed || (this.closed = true, null !== this.fd && (yield Di.closeAsync(this.fd), this.fd = null));
    });
  }
}
function Li(e2, i2, r2, n2, s2, a2) {
  return t(this, void 0, void 0, function* () {
    if (!r2.isDirectory()) {
      if (!r2.isFile()) throw new Ii(`Not a regular file: ${i2}`);
      if (!(yield Di.accessAsync(i2, Di.constants.R_OK))) throw new Ii(`No permission to read: ${i2}`);
      return void n2.push(new Ni(e2, i2, s2, false, r2.size));
    }
    const t2 = yield Di.realpathAsync(i2);
    if (a2.has(t2)) throw new Ii(`Duplicate link: ${i2}`);
    a2.add(t2), n2.push(new Ni(e2, i2, s2, true, 0));
    const o2 = yield Di.readdirAsync(i2);
    for (const t3 of o2) {
      const r3 = Ri.join(i2, t3), o3 = yield Di.statAsync(r3);
      yield Li(e2, r3, o3, n2, [...s2, t3], a2);
    }
  });
}
function Pi(e2) {
  return t(this, arguments, void 0, function* (t2, e3 = false) {
    if (!t2 || !t2.length) return;
    const i2 = [], r2 = t2.entries();
    for (const [t3, n2] of r2) {
      const r3 = Ri.resolve(n2);
      if (!(yield Di.accessAsync(r3))) throw new Ii(`No such file: ${r3}`);
      const s2 = yield Di.statAsync(r3);
      if (!e3 && s2.isDirectory()) throw new Ii(`Is a directory: ${r3}`);
      const a2 = /* @__PURE__ */ new Set();
      yield Li(t3, r3, s2, i2, [Ri.basename(r3)], a2);
    }
    return i2;
  });
}
class Oi {
  constructor(t2, e2, i2, r2, n2 = false) {
    this.closed = false, this.absPath = t2, this.fileName = e2, this.localName = i2, this.fd = r2, this.dir = n2;
  }
  getFileName() {
    return this.fileName;
  }
  getLocalName() {
    return this.localName;
  }
  isDir() {
    return this.dir;
  }
  writeFile(e2) {
    return t(this, void 0, void 0, function* () {
      yield Di.writeAsync(this.fd, e2);
    });
  }
  closeFile() {
    return t(this, void 0, void 0, function* () {
      this.closed || (this.closed = true, null !== this.fd && (yield Di.closeAsync(this.fd), this.fd = null));
    });
  }
  deleteFile() {
    return t(this, void 0, void 0, function* () {
      if (!this.absPath || !(yield Di.accessAsync(this.absPath))) return "";
      try {
        if (yield this.closeFile(), "function" == typeof Di.rm) {
          if (yield Di.rmAsync(this.absPath, { recursive: true })) return this.absPath;
        } else if (this.isDir) {
          if (yield Di.rmdirAsync(this.absPath, { recursive: true })) return this.absPath;
        } else if (yield Di.unlinkAsync(this.absPath)) return this.absPath;
      } catch (t2) {
        console.log(`delete [${this.absPath}] failed`, t2);
      }
      return "";
    });
  }
}
function Zi(e2, i2) {
  return t(this, void 0, void 0, function* () {
    if (!(yield Di.accessAsync(Ri.join(e2, i2)))) return i2;
    for (let t2 = 0; t2 < 1e3; t2++) {
      const r2 = `${i2}.${t2}`;
      if (!(yield Di.accessAsync(Ri.join(e2, r2)))) return r2;
    }
    throw new Ii("Fail to assign new file name");
  });
}
function Mi(e2) {
  return t(this, void 0, void 0, function* () {
    try {
      return yield Di.openAsync(e2, "w");
    } catch (t2) {
      if (-13 === t2.errno || -4048 === t2.errno) throw new Ii(`No permission to write: ${e2}`);
      if (-21 === t2.errno || -4068 === t2.errno) throw new Ii(`Is a directory: ${e2}`);
      throw t2;
    }
  });
}
function $i(e2) {
  return t(this, void 0, void 0, function* () {
    if (!(yield Di.accessAsync(e2))) return yield Di.mkdirAsync(e2, { recursive: true, mode: 493 }), true;
    if (!(yield Di.statAsync(e2)).isDirectory()) throw new Ii(`Not a directory: ${e2}`);
    return false;
  });
}
function ji(e2, i2, r2, n2) {
  return t(this, void 0, void 0, function* () {
    if (!r2) return (function(e3, i3, r3) {
      return t(this, void 0, void 0, function* () {
        const t2 = r3 ? i3 : yield Zi(e3, i3), n3 = Ri.join(e3, t2), s3 = yield Mi(n3);
        return new Oi(n3, i3, t2, s3);
      });
    })(e2.path, i2, n2);
    const s2 = JSON.parse(i2);
    if (!s2.hasOwnProperty("path_name") || !s2.hasOwnProperty("path_id") || !s2.hasOwnProperty("is_dir") || s2.path_name.length < 1) throw new Ii(`Invalid name: ${i2}`);
    let a2, o2;
    if (i2 = s2.path_name[s2.path_name.length - 1], n2 ? a2 = s2.path_name[0] : e2.maps.has(s2.path_id) ? a2 = e2.maps.get(s2.path_id) : (a2 = yield Zi(e2.path, s2.path_name[0]), e2.maps.set(s2.path_id, a2)), s2.path_name.length > 1) {
      const t2 = Ri.join(e2.path, a2, ...s2.path_name.slice(1, s2.path_name.length - 1));
      yield $i(t2), o2 = Ri.join(t2, i2);
    } else o2 = Ri.join(e2.path, a2);
    if (true === s2.is_dir) {
      let t2 = "";
      return (yield $i(o2)) && (t2 = o2), new Oi(t2, i2, a2, null, true);
    }
    const l2 = yield Mi(o2);
    return new Oi(o2, i2, a2, l2);
  });
}
class Hi {
  constructor(t2, e2, i2, r2) {
    this.closed = false, this.pos = 0, this.pathId = t2, this.relPath = e2, this.file = i2, this.dir = r2;
  }
  getPathId() {
    return this.pathId;
  }
  getRelPath() {
    return this.relPath;
  }
  isDir() {
    return this.dir;
  }
  getSize() {
    return this.file.size;
  }
  readFile(e2) {
    return t(this, void 0, void 0, function* () {
      if (this.pos >= this.file.size) return new Uint8Array(0);
      try {
        const t2 = Math.min(e2.byteLength, this.file.size - this.pos), i2 = this.file.slice(this.pos, this.pos + t2);
        return this.pos += t2, new Uint8Array(yield i2.arrayBuffer());
      } catch (t2) {
        if ("NotReadableError" === t2.name) throw new Ii(`No permission to read: ${this.relPath.join("/")}`);
        throw new Ii(`Read ${this.relPath.join("/")} error: ${t2.toString()}`);
      }
    });
  }
  closeFile() {
    this.closed || (this.file = null, this.closed = true);
  }
}
function Wi(e2, r2, n2, s2) {
  return t(this, void 0, void 0, function* () {
    var t2, a2, o2, l2;
    if ("file" === r2.kind) {
      const t3 = yield r2.getFile();
      n2.push(new Hi(e2, s2, t3, false));
    } else if ("directory" === r2.kind) {
      n2.push(new Hi(e2, s2, null, true));
      const f2 = r2;
      try {
        for (var h2, d2 = true, u2 = i(f2.values()); !(t2 = (h2 = yield u2.next()).done); d2 = true) {
          l2 = h2.value, d2 = false;
          const t3 = l2, i2 = t3.name;
          "file" === t3.kind ? yield Wi(e2, yield f2.getFileHandle(i2), n2, [...s2, i2]) : "directory" === t3.kind && (yield Wi(e2, yield f2.getDirectoryHandle(i2), n2, [...s2, i2]));
        }
      } catch (t3) {
        a2 = { error: t3 };
      } finally {
        try {
          d2 || t2 || !(o2 = u2.return) || (yield o2.call(u2));
        } finally {
          if (a2) throw a2.error;
        }
      }
    }
  });
}
function qi() {
  return "https:" === window.location.protocol || ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname) ? new Ii("The browser doesn't support the File System Access API") : new Ii("The File System Access API requires HTTPS except localhost");
}
function Ki() {
  return t(this, void 0, void 0, function* () {
    if ("function" != typeof window.showDirectoryPicker) throw qi();
    let t2;
    try {
      t2 = yield window.showDirectoryPicker({ id: "trzsz_upload", startIn: "documents" });
    } catch (t3) {
      if ("AbortError" === t3.name) return;
      throw t3;
    }
    const e2 = [];
    return yield Wi(0, t2, e2, [t2.name]), e2;
  });
}
class Ji {
  constructor(t2, e2, i2, r2 = false) {
    this.closed = false, this.fileName = t2, this.localName = e2, this.writer = i2, this.dir = r2;
  }
  getFileName() {
    return this.fileName;
  }
  getLocalName() {
    return this.localName;
  }
  isDir() {
    return this.dir;
  }
  writeFile(e2) {
    return t(this, void 0, void 0, function* () {
      yield this.writer.write(e2);
    });
  }
  closeFile() {
    this.closed || (this.writer.close(), this.writer = null, this.closed = true);
  }
  deleteFile() {
    return t(this, void 0, void 0, function* () {
      return "";
    });
  }
}
function Xi(e2, r2) {
  return t(this, void 0, void 0, function* () {
    var t2, n2, s2, a2;
    const o2 = /* @__PURE__ */ new Set();
    try {
      for (var l2, h2 = true, d2 = i(e2.values()); !(t2 = (l2 = yield d2.next()).done); h2 = true) {
        a2 = l2.value, h2 = false;
        const t3 = a2;
        o2.add(t3.name);
      }
    } catch (t3) {
      n2 = { error: t3 };
    } finally {
      try {
        h2 || t2 || !(s2 = d2.return) || (yield s2.call(d2));
      } finally {
        if (n2) throw n2.error;
      }
    }
    if (!o2.has(r2)) return r2;
    for (let t3 = 0; t3 < 1e3; t3++) {
      const e3 = `${r2}.${t3}`;
      if (!o2.has(e3)) return e3;
    }
  });
}
function Gi(e2, i2) {
  return t(this, void 0, void 0, function* () {
    try {
      const t2 = yield e2.getFileHandle(i2[i2.length - 1], { create: true });
      return yield t2.createWritable();
    } catch (t2) {
      if ("NoModificationAllowedError" === t2.name) throw new Ii(`No permission to write: ${i2.join("/")}`);
      if ("TypeMismatchError" === t2.name) throw new Ii(`Is a directory: ${i2.join("/")}`);
      throw new Ii(`Write ${i2.join("/")} error: ${t2.toString()}`);
    }
  });
}
function Yi(e2, i2) {
  return t(this, void 0, void 0, function* () {
    try {
      return yield e2.getDirectoryHandle(i2[i2.length - 1], { create: true });
    } catch (t2) {
      if ("InvalidStateError" === t2.name) throw new Ii(`No permission to create: ${i2.join("/")}`);
      if ("TypeMismatchError" === t2.name) throw new Ii(`Not a directory: ${i2.join("/")}`);
      throw new Ii(`Create ${i2.join("/")} error: ${t2.toString()}`);
    }
  });
}
function Qi(e2, i2, r2, n2) {
  return t(this, void 0, void 0, function* () {
    const s2 = e2.handle;
    if (!r2) return yield (function(e3, i3, r3) {
      return t(this, void 0, void 0, function* () {
        const t2 = r3 ? i3 : yield Xi(e3, i3), n3 = yield Gi(e3, [e3.name, t2]);
        return new Ji(i3, t2, n3);
      });
    })(s2, i2, n2);
    const a2 = JSON.parse(i2);
    if (!a2.hasOwnProperty("path_name") || !a2.hasOwnProperty("path_id") || !a2.hasOwnProperty("is_dir") || a2.path_name.length < 1) throw new Ii(`Invalid name: ${i2}`);
    let o2;
    i2 = a2.path_name[a2.path_name.length - 1], n2 ? o2 = a2.path_name[0] : e2.maps.has(a2.path_id) ? o2 = e2.maps.get(a2.path_id) : (o2 = yield Xi(s2, a2.path_name[0]), e2.maps.set(a2.path_id, o2));
    let l2 = s2;
    const h2 = [s2.name, o2];
    if (a2.path_name.length > 1) {
      l2 = yield Yi(l2, h2);
      for (let t2 = 1; t2 < a2.path_name.length - 1; t2++) h2.push(a2.path_name[t2]), l2 = yield Yi(l2, h2);
      h2.push(i2);
    }
    if (true === a2.is_dir) return yield Yi(l2, h2), new Ji(i2, o2, null, true);
    const d2 = yield Gi(l2, h2);
    return new Ji(i2, o2, d2);
  });
}
const Vi = new Int32Array(4);
class tr {
  static hashStr(t2, e2 = false) {
    return this.onePassHasher.start().appendStr(t2).end(e2);
  }
  static hashAsciiStr(t2, e2 = false) {
    return this.onePassHasher.start().appendAsciiStr(t2).end(e2);
  }
  static stateIdentity = new Int32Array([1732584193, -271733879, -1732584194, 271733878]);
  static buffer32Identity = new Int32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  static hexChars = "0123456789abcdef";
  static hexOut = [];
  static onePassHasher = new tr();
  static _hex(t2) {
    const e2 = tr.hexChars, i2 = tr.hexOut;
    let r2, n2, s2, a2;
    for (a2 = 0; a2 < 4; a2 += 1) for (n2 = 8 * a2, r2 = t2[a2], s2 = 0; s2 < 8; s2 += 2) i2[n2 + 1 + s2] = e2.charAt(15 & r2), r2 >>>= 4, i2[n2 + 0 + s2] = e2.charAt(15 & r2), r2 >>>= 4;
    return i2.join("");
  }
  static _md5cycle(t2, e2) {
    let i2 = t2[0], r2 = t2[1], n2 = t2[2], s2 = t2[3];
    i2 += (r2 & n2 | ~r2 & s2) + e2[0] - 680876936 | 0, i2 = (i2 << 7 | i2 >>> 25) + r2 | 0, s2 += (i2 & r2 | ~i2 & n2) + e2[1] - 389564586 | 0, s2 = (s2 << 12 | s2 >>> 20) + i2 | 0, n2 += (s2 & i2 | ~s2 & r2) + e2[2] + 606105819 | 0, n2 = (n2 << 17 | n2 >>> 15) + s2 | 0, r2 += (n2 & s2 | ~n2 & i2) + e2[3] - 1044525330 | 0, r2 = (r2 << 22 | r2 >>> 10) + n2 | 0, i2 += (r2 & n2 | ~r2 & s2) + e2[4] - 176418897 | 0, i2 = (i2 << 7 | i2 >>> 25) + r2 | 0, s2 += (i2 & r2 | ~i2 & n2) + e2[5] + 1200080426 | 0, s2 = (s2 << 12 | s2 >>> 20) + i2 | 0, n2 += (s2 & i2 | ~s2 & r2) + e2[6] - 1473231341 | 0, n2 = (n2 << 17 | n2 >>> 15) + s2 | 0, r2 += (n2 & s2 | ~n2 & i2) + e2[7] - 45705983 | 0, r2 = (r2 << 22 | r2 >>> 10) + n2 | 0, i2 += (r2 & n2 | ~r2 & s2) + e2[8] + 1770035416 | 0, i2 = (i2 << 7 | i2 >>> 25) + r2 | 0, s2 += (i2 & r2 | ~i2 & n2) + e2[9] - 1958414417 | 0, s2 = (s2 << 12 | s2 >>> 20) + i2 | 0, n2 += (s2 & i2 | ~s2 & r2) + e2[10] - 42063 | 0, n2 = (n2 << 17 | n2 >>> 15) + s2 | 0, r2 += (n2 & s2 | ~n2 & i2) + e2[11] - 1990404162 | 0, r2 = (r2 << 22 | r2 >>> 10) + n2 | 0, i2 += (r2 & n2 | ~r2 & s2) + e2[12] + 1804603682 | 0, i2 = (i2 << 7 | i2 >>> 25) + r2 | 0, s2 += (i2 & r2 | ~i2 & n2) + e2[13] - 40341101 | 0, s2 = (s2 << 12 | s2 >>> 20) + i2 | 0, n2 += (s2 & i2 | ~s2 & r2) + e2[14] - 1502002290 | 0, n2 = (n2 << 17 | n2 >>> 15) + s2 | 0, r2 += (n2 & s2 | ~n2 & i2) + e2[15] + 1236535329 | 0, r2 = (r2 << 22 | r2 >>> 10) + n2 | 0, i2 += (r2 & s2 | n2 & ~s2) + e2[1] - 165796510 | 0, i2 = (i2 << 5 | i2 >>> 27) + r2 | 0, s2 += (i2 & n2 | r2 & ~n2) + e2[6] - 1069501632 | 0, s2 = (s2 << 9 | s2 >>> 23) + i2 | 0, n2 += (s2 & r2 | i2 & ~r2) + e2[11] + 643717713 | 0, n2 = (n2 << 14 | n2 >>> 18) + s2 | 0, r2 += (n2 & i2 | s2 & ~i2) + e2[0] - 373897302 | 0, r2 = (r2 << 20 | r2 >>> 12) + n2 | 0, i2 += (r2 & s2 | n2 & ~s2) + e2[5] - 701558691 | 0, i2 = (i2 << 5 | i2 >>> 27) + r2 | 0, s2 += (i2 & n2 | r2 & ~n2) + e2[10] + 38016083 | 0, s2 = (s2 << 9 | s2 >>> 23) + i2 | 0, n2 += (s2 & r2 | i2 & ~r2) + e2[15] - 660478335 | 0, n2 = (n2 << 14 | n2 >>> 18) + s2 | 0, r2 += (n2 & i2 | s2 & ~i2) + e2[4] - 405537848 | 0, r2 = (r2 << 20 | r2 >>> 12) + n2 | 0, i2 += (r2 & s2 | n2 & ~s2) + e2[9] + 568446438 | 0, i2 = (i2 << 5 | i2 >>> 27) + r2 | 0, s2 += (i2 & n2 | r2 & ~n2) + e2[14] - 1019803690 | 0, s2 = (s2 << 9 | s2 >>> 23) + i2 | 0, n2 += (s2 & r2 | i2 & ~r2) + e2[3] - 187363961 | 0, n2 = (n2 << 14 | n2 >>> 18) + s2 | 0, r2 += (n2 & i2 | s2 & ~i2) + e2[8] + 1163531501 | 0, r2 = (r2 << 20 | r2 >>> 12) + n2 | 0, i2 += (r2 & s2 | n2 & ~s2) + e2[13] - 1444681467 | 0, i2 = (i2 << 5 | i2 >>> 27) + r2 | 0, s2 += (i2 & n2 | r2 & ~n2) + e2[2] - 51403784 | 0, s2 = (s2 << 9 | s2 >>> 23) + i2 | 0, n2 += (s2 & r2 | i2 & ~r2) + e2[7] + 1735328473 | 0, n2 = (n2 << 14 | n2 >>> 18) + s2 | 0, r2 += (n2 & i2 | s2 & ~i2) + e2[12] - 1926607734 | 0, r2 = (r2 << 20 | r2 >>> 12) + n2 | 0, i2 += (r2 ^ n2 ^ s2) + e2[5] - 378558 | 0, i2 = (i2 << 4 | i2 >>> 28) + r2 | 0, s2 += (i2 ^ r2 ^ n2) + e2[8] - 2022574463 | 0, s2 = (s2 << 11 | s2 >>> 21) + i2 | 0, n2 += (s2 ^ i2 ^ r2) + e2[11] + 1839030562 | 0, n2 = (n2 << 16 | n2 >>> 16) + s2 | 0, r2 += (n2 ^ s2 ^ i2) + e2[14] - 35309556 | 0, r2 = (r2 << 23 | r2 >>> 9) + n2 | 0, i2 += (r2 ^ n2 ^ s2) + e2[1] - 1530992060 | 0, i2 = (i2 << 4 | i2 >>> 28) + r2 | 0, s2 += (i2 ^ r2 ^ n2) + e2[4] + 1272893353 | 0, s2 = (s2 << 11 | s2 >>> 21) + i2 | 0, n2 += (s2 ^ i2 ^ r2) + e2[7] - 155497632 | 0, n2 = (n2 << 16 | n2 >>> 16) + s2 | 0, r2 += (n2 ^ s2 ^ i2) + e2[10] - 1094730640 | 0, r2 = (r2 << 23 | r2 >>> 9) + n2 | 0, i2 += (r2 ^ n2 ^ s2) + e2[13] + 681279174 | 0, i2 = (i2 << 4 | i2 >>> 28) + r2 | 0, s2 += (i2 ^ r2 ^ n2) + e2[0] - 358537222 | 0, s2 = (s2 << 11 | s2 >>> 21) + i2 | 0, n2 += (s2 ^ i2 ^ r2) + e2[3] - 722521979 | 0, n2 = (n2 << 16 | n2 >>> 16) + s2 | 0, r2 += (n2 ^ s2 ^ i2) + e2[6] + 76029189 | 0, r2 = (r2 << 23 | r2 >>> 9) + n2 | 0, i2 += (r2 ^ n2 ^ s2) + e2[9] - 640364487 | 0, i2 = (i2 << 4 | i2 >>> 28) + r2 | 0, s2 += (i2 ^ r2 ^ n2) + e2[12] - 421815835 | 0, s2 = (s2 << 11 | s2 >>> 21) + i2 | 0, n2 += (s2 ^ i2 ^ r2) + e2[15] + 530742520 | 0, n2 = (n2 << 16 | n2 >>> 16) + s2 | 0, r2 += (n2 ^ s2 ^ i2) + e2[2] - 995338651 | 0, r2 = (r2 << 23 | r2 >>> 9) + n2 | 0, i2 += (n2 ^ (r2 | ~s2)) + e2[0] - 198630844 | 0, i2 = (i2 << 6 | i2 >>> 26) + r2 | 0, s2 += (r2 ^ (i2 | ~n2)) + e2[7] + 1126891415 | 0, s2 = (s2 << 10 | s2 >>> 22) + i2 | 0, n2 += (i2 ^ (s2 | ~r2)) + e2[14] - 1416354905 | 0, n2 = (n2 << 15 | n2 >>> 17) + s2 | 0, r2 += (s2 ^ (n2 | ~i2)) + e2[5] - 57434055 | 0, r2 = (r2 << 21 | r2 >>> 11) + n2 | 0, i2 += (n2 ^ (r2 | ~s2)) + e2[12] + 1700485571 | 0, i2 = (i2 << 6 | i2 >>> 26) + r2 | 0, s2 += (r2 ^ (i2 | ~n2)) + e2[3] - 1894986606 | 0, s2 = (s2 << 10 | s2 >>> 22) + i2 | 0, n2 += (i2 ^ (s2 | ~r2)) + e2[10] - 1051523 | 0, n2 = (n2 << 15 | n2 >>> 17) + s2 | 0, r2 += (s2 ^ (n2 | ~i2)) + e2[1] - 2054922799 | 0, r2 = (r2 << 21 | r2 >>> 11) + n2 | 0, i2 += (n2 ^ (r2 | ~s2)) + e2[8] + 1873313359 | 0, i2 = (i2 << 6 | i2 >>> 26) + r2 | 0, s2 += (r2 ^ (i2 | ~n2)) + e2[15] - 30611744 | 0, s2 = (s2 << 10 | s2 >>> 22) + i2 | 0, n2 += (i2 ^ (s2 | ~r2)) + e2[6] - 1560198380 | 0, n2 = (n2 << 15 | n2 >>> 17) + s2 | 0, r2 += (s2 ^ (n2 | ~i2)) + e2[13] + 1309151649 | 0, r2 = (r2 << 21 | r2 >>> 11) + n2 | 0, i2 += (n2 ^ (r2 | ~s2)) + e2[4] - 145523070 | 0, i2 = (i2 << 6 | i2 >>> 26) + r2 | 0, s2 += (r2 ^ (i2 | ~n2)) + e2[11] - 1120210379 | 0, s2 = (s2 << 10 | s2 >>> 22) + i2 | 0, n2 += (i2 ^ (s2 | ~r2)) + e2[2] + 718787259 | 0, n2 = (n2 << 15 | n2 >>> 17) + s2 | 0, r2 += (s2 ^ (n2 | ~i2)) + e2[9] - 343485551 | 0, r2 = (r2 << 21 | r2 >>> 11) + n2 | 0, t2[0] = i2 + t2[0] | 0, t2[1] = r2 + t2[1] | 0, t2[2] = n2 + t2[2] | 0, t2[3] = s2 + t2[3] | 0;
  }
  _dataLength = 0;
  _bufferLength = 0;
  _state = new Int32Array(4);
  _buffer = new ArrayBuffer(68);
  _buffer8;
  _buffer32;
  constructor() {
    this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
  }
  start() {
    return this._dataLength = 0, this._bufferLength = 0, this._state.set(tr.stateIdentity), this;
  }
  appendStr(t2) {
    const e2 = this._buffer8, i2 = this._buffer32;
    let r2, n2, s2 = this._bufferLength;
    for (n2 = 0; n2 < t2.length; n2 += 1) {
      if (r2 = t2.charCodeAt(n2), r2 < 128) e2[s2++] = r2;
      else if (r2 < 2048) e2[s2++] = (r2 >>> 6) + 192, e2[s2++] = 63 & r2 | 128;
      else if (r2 < 55296 || r2 > 56319) e2[s2++] = (r2 >>> 12) + 224, e2[s2++] = r2 >>> 6 & 63 | 128, e2[s2++] = 63 & r2 | 128;
      else {
        if (r2 = 1024 * (r2 - 55296) + (t2.charCodeAt(++n2) - 56320) + 65536, r2 > 1114111) throw new Error("Unicode standard supports code points up to U+10FFFF");
        e2[s2++] = (r2 >>> 18) + 240, e2[s2++] = r2 >>> 12 & 63 | 128, e2[s2++] = r2 >>> 6 & 63 | 128, e2[s2++] = 63 & r2 | 128;
      }
      s2 >= 64 && (this._dataLength += 64, tr._md5cycle(this._state, i2), s2 -= 64, i2[0] = i2[16]);
    }
    return this._bufferLength = s2, this;
  }
  appendAsciiStr(t2) {
    const e2 = this._buffer8, i2 = this._buffer32;
    let r2, n2 = this._bufferLength, s2 = 0;
    for (; ; ) {
      for (r2 = Math.min(t2.length - s2, 64 - n2); r2--; ) e2[n2++] = t2.charCodeAt(s2++);
      if (n2 < 64) break;
      this._dataLength += 64, tr._md5cycle(this._state, i2), n2 = 0;
    }
    return this._bufferLength = n2, this;
  }
  appendByteArray(t2) {
    const e2 = this._buffer8, i2 = this._buffer32;
    let r2, n2 = this._bufferLength, s2 = 0;
    for (; ; ) {
      for (r2 = Math.min(t2.length - s2, 64 - n2); r2--; ) e2[n2++] = t2[s2++];
      if (n2 < 64) break;
      this._dataLength += 64, tr._md5cycle(this._state, i2), n2 = 0;
    }
    return this._bufferLength = n2, this;
  }
  getState() {
    const t2 = this._state;
    return { buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)), buflen: this._bufferLength, length: this._dataLength, state: [t2[0], t2[1], t2[2], t2[3]] };
  }
  setState(t2) {
    const e2 = t2.buffer, i2 = t2.state, r2 = this._state;
    let n2;
    for (this._dataLength = t2.length, this._bufferLength = t2.buflen, r2[0] = i2[0], r2[1] = i2[1], r2[2] = i2[2], r2[3] = i2[3], n2 = 0; n2 < e2.length; n2 += 1) this._buffer8[n2] = e2.charCodeAt(n2);
  }
  end(t2 = false) {
    const e2 = this._bufferLength, i2 = this._buffer8, r2 = this._buffer32, n2 = 1 + (e2 >> 2);
    this._dataLength += e2;
    const s2 = 8 * this._dataLength;
    if (i2[e2] = 128, i2[e2 + 1] = i2[e2 + 2] = i2[e2 + 3] = 0, r2.set(tr.buffer32Identity.subarray(n2), n2), e2 > 55 && (tr._md5cycle(this._state, r2), r2.set(tr.buffer32Identity)), s2 <= 4294967295) r2[14] = s2;
    else {
      const e3 = s2.toString(16).match(/(.*?)(.{0,8})$/);
      if (null === e3) return t2 ? Vi : "";
      const i3 = parseInt(e3[2], 16), n3 = parseInt(e3[1], 16) || 0;
      r2[14] = i3, r2[15] = n3;
    }
    return tr._md5cycle(this._state, r2), t2 ? this._state : tr._hex(this._state);
  }
}
if ("5d41402abc4b2a76b9719d911017c592" !== tr.hashStr("hello")) throw new Error("Md5 self test failed.");
function er(t2) {
  return 97 <= t2 && t2 <= 122 || (65 <= t2 && t2 <= 90 || (48 <= t2 && t2 <= 57 || (35 == t2 || 58 == t2 || 43 == t2 || 47 == t2 || 61 == t2)));
}
class ir {
  constructor() {
    this.bufArray = [], this.resolve = null, this.reject = null, this.bufHead = 0, this.bufTail = 0, this.nextIdx = 0, this.nextBuf = null, this.arrBuf = new ArrayBuffer(128);
  }
  addBuffer(t2) {
    this.bufArray[this.bufTail++] = t2, this.resolve && (this.resolve(), this.resolve = null, this.reject = null);
  }
  stopBuffer() {
    this.reject && (this.reject(new Ii("Stopped")), this.reject = null, this.resolve = null);
  }
  drainBuffer() {
    this.bufArray = [], this.bufHead = 0, this.bufTail = 0;
  }
  toUint8Array(e2) {
    return t(this, void 0, void 0, function* () {
      if ("string" == typeof e2) return zi(e2);
      if (e2 instanceof ArrayBuffer) return new Uint8Array(e2);
      if (e2 instanceof Uint8Array) return e2;
      if (e2 instanceof Blob) {
        const t2 = yield e2.arrayBuffer();
        return new Uint8Array(t2);
      }
      throw new Ii("The buffer type is not supported", null, true);
    });
  }
  nextBuffer() {
    return t(this, void 0, void 0, function* () {
      if (this.nextBuf && this.nextIdx < this.nextBuf.length) return this.nextBuf.subarray(this.nextIdx);
      this.bufHead === this.bufTail && (0 !== this.bufHead && (this.bufHead = 0, this.bufTail = 0), yield new Promise((t3, e2) => {
        this.resolve = t3, this.reject = e2;
      }));
      const t2 = this.bufArray[this.bufHead];
      return this.bufArray[this.bufHead] = null, this.bufHead++, this.nextBuf = yield this.toUint8Array(t2), this.nextIdx = 0, this.nextBuf;
    });
  }
  growBuffer(t2, e2, i2) {
    const r2 = Math.max(2 * t2.length, e2 + i2);
    this.arrBuf = new ArrayBuffer(r2);
    const n2 = new Uint8Array(this.arrBuf);
    return n2.set(t2.subarray(0, e2)), n2;
  }
  appendBuffer(t2, e2, i2) {
    const r2 = t2.length >= e2 + i2.length ? t2 : this.growBuffer(t2, e2, i2.length);
    return r2.set(i2, e2), r2;
  }
  readLine() {
    return t(this, void 0, void 0, function* () {
      let t2 = new Uint8Array(this.arrBuf), e2 = 0;
      for (; ; ) {
        let i2 = yield this.nextBuffer();
        const r2 = i2.indexOf(10);
        if (r2 >= 0 ? (this.nextIdx += r2 + 1, i2 = i2.subarray(0, r2)) : this.nextIdx += i2.length, i2.includes(3)) throw new Ii("Interrupted");
        if (t2 = this.appendBuffer(t2, e2, i2), e2 += i2.length, r2 >= 0) return Ai(t2.subarray(0, e2));
      }
    });
  }
  readBinary(e2) {
    return t(this, void 0, void 0, function* () {
      this.arrBuf.byteLength < e2 && (this.arrBuf = new ArrayBuffer(e2));
      const t2 = new Uint8Array(this.arrBuf, 0, e2);
      let i2 = 0;
      for (; i2 < e2; ) {
        const r2 = e2 - i2;
        let n2 = yield this.nextBuffer();
        n2.length > r2 ? (this.nextIdx += r2, n2 = n2.subarray(0, r2)) : this.nextIdx += n2.length, t2.set(n2, i2), i2 += n2.length;
      }
      return t2;
    });
  }
  readLineOnWindows() {
    return t(this, void 0, void 0, function* () {
      let t2 = new Uint8Array(this.arrBuf), e2 = 27, i2 = false, r2 = false, n2 = false, s2 = false, a2 = false, o2 = 0;
      for (; ; ) {
        let l2 = yield this.nextBuffer();
        const h2 = l2.indexOf(33);
        h2 >= 0 ? (this.nextIdx += h2 + 1, l2 = l2.subarray(0, h2)) : this.nextIdx += l2.length;
        for (let h3 = 0; h3 < l2.length; h3++) {
          const d2 = l2[h3];
          if (3 == d2) throw new Ii("Interrupted");
          if (10 == d2 && (r2 = true), i2) Ei(d2) && (i2 = false, 72 == d2 && e2 >= 48 && e2 <= 57 && (n2 = true)), 91 == e2 && 72 == d2 && (s2 = true), e2 = d2;
          else if (27 == d2) i2 = true, e2 = d2;
          else if (er(d2)) {
            if (n2 && (n2 = false, r2 && o2 > 0 && (d2 == t2[o2 - 1] || a2))) {
              t2[o2 - 1] = d2;
              continue;
            }
            o2 >= t2.length && (t2 = this.growBuffer(t2, o2, l2.length)), t2[o2++] = d2, a2 = s2, s2 = false, r2 = false;
          }
        }
        if (h2 >= 0 && o2 > 0 && !i2) return Ai(t2.subarray(0, o2));
      }
    });
  }
}
function rr(t2) {
  const e2 = [];
  for (let i2 = 0; i2 < t2.length; i2++) e2.push([t2[i2][0].charCodeAt(0), t2[i2][1].charCodeAt(0), t2[i2][1].charCodeAt(1)]);
  return e2;
}
class nr {
  constructor(t2, e2 = false, i2 = nr.MAX_DATA_CHUNK_SIZE) {
    this.buffer = new ir(), this.remoteIsWindows = false, this.lastInputTime = 0, this.openedFiles = [], this.createdFiles = [], this.tmuxOutputJunk = false, this.cleanTimeoutInMilliseconds = 100, this.transferConfig = {}, this.stopped = false, this.maxChunkTimeInMilliseconds = 0, this.protocolNewline = "\n", this.writer = t2, this.isWindowsShell = e2, this.maxDataChunkSize = i2;
  }
  cleanup() {
    for (const t2 of this.openedFiles) t2.closeFile();
  }
  addReceivedData(t2) {
    this.stopped || this.buffer.addBuffer(t2), this.lastInputTime = Date.now();
  }
  stopTransferring() {
    return t(this, void 0, void 0, function* () {
      this.cleanTimeoutInMilliseconds = Math.max(2 * this.maxChunkTimeInMilliseconds, 500), this.stopped = true, this.buffer.stopBuffer();
    });
  }
  cleanInput(e2) {
    return t(this, void 0, void 0, function* () {
      for (this.stopped = true, this.buffer.drainBuffer(), this.lastInputTime = Date.now(); ; ) {
        const t2 = e2 - (Date.now() - this.lastInputTime);
        if (t2 <= 0) return;
        yield new Promise((e3) => setTimeout(e3, t2));
      }
    });
  }
  sendLine(e2, i2) {
    return t(this, void 0, void 0, function* () {
      this.writer(`#${e2}:${i2}${this.protocolNewline}`);
    });
  }
  recvLine(e2) {
    return t(this, arguments, void 0, function* (t2, e3 = false) {
      if (this.stopped) throw new Ii("Stopped");
      if (this.isWindowsShell || this.remoteIsWindows) {
        let e4 = yield this.buffer.readLineOnWindows();
        const i3 = e4.lastIndexOf("#" + t2 + ":");
        if (i3 >= 0) e4 = e4.substring(i3);
        else {
          const t3 = e4.lastIndexOf("#");
          t3 > 0 && (e4 = e4.substring(t3));
        }
        return e4;
      }
      let i2 = yield this.buffer.readLine();
      if (this.tmuxOutputJunk || e3) {
        if (i2.length > 0) for (; "\r" === i2[i2.length - 1]; ) i2 = i2.substring(0, i2.length - 1) + (yield this.buffer.readLine());
        const e4 = i2.lastIndexOf("#" + t2 + ":");
        if (e4 >= 0) i2 = i2.substring(e4);
        else {
          const t3 = i2.lastIndexOf("#");
          t3 > 0 && (i2 = i2.substring(t3));
        }
        i2 = (function(t3) {
          for (; ; ) {
            const e5 = t3.indexOf("\x1BP=");
            if (e5 < 0) return t3;
            let i3 = e5 + 3;
            const r2 = t3.substring(i3).indexOf("\x1BP=");
            if (r2 < 0) return t3.substring(0, e5);
            i3 += r2 + 3;
            const n2 = t3.substring(i3).indexOf("\x1B\\");
            if (n2 < 0) return t3.substring(0, e5);
            i3 += n2 + 2, t3 = t3.substring(0, e5) + t3.substring(i3);
          }
        })(i2);
      }
      return i2;
    });
  }
  recvCheck(e2) {
    return t(this, arguments, void 0, function* (t2, e3 = false) {
      const i2 = yield this.recvLine(t2, e3), r2 = i2.indexOf(":");
      if (r2 < 1) throw new Ii(Ti(i2), "colon", true);
      const n2 = i2.substring(1, r2), s2 = i2.substring(r2 + 1);
      if (n2 != t2) throw new Ii(s2, n2, true);
      return s2;
    });
  }
  sendInteger(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendLine(e2, i2.toString());
    });
  }
  recvInteger(e2) {
    return t(this, arguments, void 0, function* (t2, e3 = false) {
      const i2 = yield this.recvCheck(t2, e3);
      return Number(i2);
    });
  }
  checkInteger(e2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvInteger("SUCC");
      if (t2 !== e2) throw new Ii(`Integer check [${t2}] <> [${e2}]`, null, true);
    });
  }
  sendString(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendLine(e2, Ti(i2));
    });
  }
  recvString(e2) {
    return t(this, arguments, void 0, function* (t2, e3 = false) {
      return Ai(Fi(yield this.recvCheck(t2, e3)), "utf8");
    });
  }
  checkString(e2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvString("SUCC");
      if (t2 !== e2) throw new Ii(`String check [${t2}] <> [${e2}]`, null, true);
    });
  }
  sendBinary(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendLine(e2, Ti(i2));
    });
  }
  recvBinary(e2) {
    return t(this, arguments, void 0, function* (t2, e3 = false) {
      return Fi(yield this.recvCheck(t2, e3));
    });
  }
  checkBinary(e2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvBinary("SUCC");
      if (t2.length != e2.length) throw new Ii(`Binary length check [${t2.length}] <> [${e2.length}]`, null, true);
      for (let i2 = 0; i2 < t2.length; i2++) if (t2[i2] != e2[i2]) throw new Ii(`Binary check [${t2[i2]}] <> [${e2[i2]}]`, null, true);
    });
  }
  sendData(e2, i2, r2) {
    return t(this, void 0, void 0, function* () {
      if (!i2) return void (yield this.sendBinary("DATA", e2));
      const t2 = (function(t3, e3) {
        if (!e3.length) return t3;
        const i3 = new Uint8Array(2 * t3.length);
        let r3 = 0;
        for (let n2 = 0; n2 < t3.length; n2++) {
          let s2 = -1;
          for (let i4 = 0; i4 < e3.length; i4++) if (t3[n2] == e3[i4][0]) {
            s2 = i4;
            break;
          }
          s2 < 0 ? i3[r3++] = t3[n2] : (i3[r3++] = e3[s2][1], i3[r3++] = e3[s2][2]);
        }
        return i3.subarray(0, r3);
      })(e2, r2);
      this.writer(`#DATA:${t2.length}
`), this.writer(t2);
    });
  }
  recvData(e2, i2, r2) {
    return t(this, void 0, void 0, function* () {
      return yield Promise.race([new Promise((t2, e3) => setTimeout(() => {
        this.cleanTimeoutInMilliseconds = 3e3, e3(new Ii("Receive data timeout"));
      }, r2)), (() => t(this, void 0, void 0, function* () {
        if (!e2) return yield this.recvBinary("DATA");
        const t2 = yield this.recvInteger("DATA");
        return (function(t3, e3) {
          if (!e3.length) return t3;
          const i3 = new Uint8Array(t3.length);
          let r3 = 0;
          for (let n2 = 0; n2 < t3.length; n2++) {
            let s2 = -1;
            if (n2 < t3.length - 1) {
              for (let i4 = 0; i4 < e3.length; i4++) if (t3[n2] == e3[i4][1] && t3[n2 + 1] == e3[i4][2]) {
                s2 = i4;
                break;
              }
            }
            s2 < 0 ? i3[r3++] = t3[n2] : (i3[r3++] = e3[s2][0], n2++);
          }
          return i3.subarray(0, r3);
        })(yield this.buffer.readBinary(t2), i2);
      }))()]);
    });
  }
  sendAction(e2, i2) {
    return t(this, void 0, void 0, function* () {
      const t2 = { lang: "js", confirm: e2, version: "1.1.6", support_dir: true };
      (this.isWindowsShell || i2) && (t2.binary = false, t2.newline = "!\n"), i2 && (this.remoteIsWindows = true, this.protocolNewline = "!\n"), yield this.sendString("ACT", JSON.stringify(t2));
    });
  }
  recvAction() {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvString("ACT", true), e2 = JSON.parse(t2);
      return e2.newline && (this.protocolNewline = e2.newline), e2;
    });
  }
  sendConfig(e2, i2, r2, n2) {
    return t(this, void 0, void 0, function* () {
      const t2 = { lang: "js" };
      e2.quiet && (t2.quiet = true), e2.binary && (t2.binary = true, t2.escape_chars = i2), e2.directory && (t2.directory = true), e2.bufsize && (t2.bufsize = e2.bufsize), e2.timeout && (t2.timeout = e2.timeout), e2.overwrite && (t2.overwrite = true), r2 == Ci && (t2.tmux_output_junk = true), n2 > 0 && (t2.tmux_pane_width = n2);
      let s2 = JSON.stringify(t2);
      s2 = s2.replace(/[\u007F-\uFFFF]/g, function(t3) {
        return "\\u" + ("0000" + t3.charCodeAt(0).toString(16)).slice(-4);
      }), this.transferConfig = t2, yield this.sendString("CFG", s2);
    });
  }
  recvConfig() {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvString("CFG", true);
      return this.transferConfig = JSON.parse(t2), this.tmuxOutputJunk = true === this.transferConfig.tmux_output_junk, this.transferConfig;
    });
  }
  clientExit(e2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendString("EXIT", e2);
    });
  }
  recvExit() {
    return t(this, void 0, void 0, function* () {
      return this.recvString("EXIT");
    });
  }
  serverExit(e2) {
    return t(this, void 0, void 0, function* () {
      yield this.cleanInput(500), yield (function() {
        return t(this, void 0, void 0, function* () {
        });
      })(), this.isWindowsShell ? (e2 = e2.replace(/\n/g, "\r\n"), process.stdout.write("\x1B[H\x1B[2J\x1B[?1049l")) : process.stdout.write("\x1B8\x1B[0J"), process.stdout.write(e2), process.stdout.write("\r\n"), process.stdout.write("\x1B[?25h"), this.transferConfig.tmux_output_junk && (yield (function() {
        return t(this, void 0, void 0, function* () {
          const t2 = require("util").promisify(require("child_process").exec);
          yield t2("tmux refresh-client");
        });
      })());
    });
  }
  deleteCreatedFiles() {
    return t(this, void 0, void 0, function* () {
      const t2 = [];
      for (const e2 of this.createdFiles) {
        const i2 = yield e2.deleteFile();
        i2 && t2.push(i2);
      }
      return t2;
    });
  }
  clientError(e2) {
    return t(this, void 0, void 0, function* () {
      yield this.cleanInput(this.cleanTimeoutInMilliseconds);
      const t2 = Ii.getErrorMessage(e2);
      let i2 = true;
      if (e2 instanceof Ii) {
        if (i2 = e2.isTraceBack(), e2.isRemoteExit()) return;
        if (e2.isRemoteFail()) return void (i2 && console.log(t2));
      }
      yield this.sendString(i2 ? "FAIL" : "fail", t2), i2 && console.log(t2);
    });
  }
  serverError(e2) {
    return t(this, void 0, void 0, function* () {
      yield this.cleanInput(this.cleanTimeoutInMilliseconds);
      const t2 = Ii.getErrorMessage(e2);
      let i2 = true;
      if (e2 instanceof Ii) {
        if (e2.isStopAndDelete()) {
          const t3 = yield this.deleteCreatedFiles();
          if (t3 && t3.length) return void (yield this.serverExit([e2.message + ":"].concat(t3).join("\r\n- ")));
        }
        if (i2 = e2.isTraceBack(), e2.isRemoteExit() || e2.isRemoteFail()) return void (yield this.serverExit(t2));
      }
      yield this.sendString(i2 ? "FAIL" : "fail", t2), yield this.serverExit(t2);
    });
  }
  sendFileNum(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendInteger("NUM", e2), yield this.checkInteger(e2), i2 && i2.onNum(e2);
    });
  }
  sendFileName(e2, i2, r2) {
    return t(this, void 0, void 0, function* () {
      const t2 = e2.getRelPath(), n2 = t2[t2.length - 1];
      if (i2) {
        const i3 = { path_id: e2.getPathId(), path_name: t2, is_dir: e2.isDir() };
        yield this.sendString("NAME", JSON.stringify(i3));
      } else yield this.sendString("NAME", n2);
      const s2 = yield this.recvString("SUCC");
      return r2 && r2.onName(n2), s2;
    });
  }
  sendFileSize(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendInteger("SIZE", e2), yield this.checkInteger(e2), i2 && i2.onSize(e2);
    });
  }
  sendFileData(e2, i2, r2, n2, s2, a2) {
    return t(this, void 0, void 0, function* () {
      let t2 = 0;
      a2 && a2.onStep(t2);
      let o2 = 1024, l2 = new ArrayBuffer(o2);
      const h2 = new tr();
      for (; t2 < i2; ) {
        const i3 = Date.now(), d2 = yield e2.readFile(l2);
        yield this.sendData(d2, r2, n2), h2.appendByteArray(d2), yield this.checkInteger(d2.length), t2 += d2.length, a2 && a2.onStep(t2);
        const u2 = Date.now() - i3;
        d2.length == o2 && u2 < 500 && o2 < s2 ? (o2 = Math.min(2 * o2, s2), l2 = new ArrayBuffer(o2)) : u2 >= 2e3 && o2 > 1024 && (o2 = 1024, l2 = new ArrayBuffer(o2)), u2 > this.maxChunkTimeInMilliseconds && (this.maxChunkTimeInMilliseconds = u2);
      }
      return new Uint8Array(h2.end(true).buffer);
    });
  }
  sendFileMD5(e2, i2) {
    return t(this, void 0, void 0, function* () {
      yield this.sendBinary("MD5", e2), yield this.checkBinary(e2), i2 && i2.onDone();
    });
  }
  sendFiles(e2, i2) {
    return t(this, void 0, void 0, function* () {
      this.openedFiles.push(...e2);
      const t2 = true === this.transferConfig.binary, r2 = true === this.transferConfig.directory, n2 = this.transferConfig.bufsize ? Math.min(this.transferConfig.bufsize, this.maxDataChunkSize) : this.maxDataChunkSize, s2 = this.transferConfig.escape_chars ? rr(this.transferConfig.escape_chars) : [];
      yield this.sendFileNum(e2.length, i2);
      const a2 = [];
      for (const o2 of e2) {
        const e3 = yield this.sendFileName(o2, r2, i2);
        if (a2.includes(e3) || a2.push(e3), o2.isDir()) continue;
        const l2 = o2.getSize();
        yield this.sendFileSize(l2, i2);
        const h2 = yield this.sendFileData(o2, l2, t2, s2, n2, i2);
        o2.closeFile(), yield this.sendFileMD5(h2, i2);
      }
      return a2;
    });
  }
  recvFileNum(e2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvInteger("NUM");
      return yield this.sendInteger("SUCC", t2), e2 && e2.onNum(t2), t2;
    });
  }
  recvFileName(e2, i2, r2, n2, s2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvString("NAME"), a2 = yield i2(e2, t2, r2, n2);
      return this.createdFiles.push(a2), yield this.sendString("SUCC", a2.getLocalName()), s2 && s2.onName(a2.getFileName()), a2;
    });
  }
  recvFileSize(e2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvInteger("SIZE");
      return yield this.sendInteger("SUCC", t2), e2 && e2.onSize(t2), t2;
    });
  }
  recvFileData(e2, i2, r2, n2, s2, a2) {
    return t(this, void 0, void 0, function* () {
      let t2 = 0;
      a2 && a2.onStep(t2);
      const o2 = new tr();
      for (; t2 < i2; ) {
        const i3 = Date.now(), l2 = yield this.recvData(r2, n2, s2);
        yield e2.writeFile(l2), t2 += l2.length, a2 && a2.onStep(t2), yield this.sendInteger("SUCC", l2.length), o2.appendByteArray(l2);
        const h2 = Date.now() - i3;
        h2 > this.maxChunkTimeInMilliseconds && (this.maxChunkTimeInMilliseconds = h2);
      }
      return new Uint8Array(o2.end(true).buffer);
    });
  }
  recvFileMD5(e2, i2) {
    return t(this, void 0, void 0, function* () {
      const t2 = yield this.recvBinary("MD5");
      if (e2.length != t2.length) throw new Ii("Check MD5 failed");
      for (let i3 = 0; i3 < e2.length; i3++) if (e2[i3] != t2[i3]) throw new Ii("Check MD5 failed");
      yield this.sendBinary("SUCC", e2), i2 && i2.onDone();
    });
  }
  recvFiles(e2, i2, r2) {
    return t(this, void 0, void 0, function* () {
      const t2 = true === this.transferConfig.binary, n2 = true === this.transferConfig.directory, s2 = true === this.transferConfig.overwrite, a2 = this.transferConfig.timeout ? 1e3 * this.transferConfig.timeout : 1e5, o2 = this.transferConfig.escape_chars ? rr(this.transferConfig.escape_chars) : [], l2 = yield this.recvFileNum(r2), h2 = [];
      for (let d2 = 0; d2 < l2; d2++) {
        const l3 = yield this.recvFileName(e2, i2, n2, s2, r2);
        if (h2.includes(l3.getLocalName()) || h2.push(l3.getLocalName()), l3.isDir()) continue;
        this.openedFiles.push(l3);
        const d3 = yield this.recvFileSize(r2), u2 = yield this.recvFileData(l3, d3, t2, o2, a2, r2);
        l3.closeFile(), yield this.recvFileMD5(u2, r2);
      }
      return h2;
    });
  }
}
function sr(t2, e2) {
  e2 -= 3;
  let i2 = 0, r2 = "";
  for (let n2 = 0; n2 < t2.length; n2++) {
    if (t2.charCodeAt(n2) >= 19968 && t2.charCodeAt(n2) <= 40869) {
      if (i2 + 2 > e2) return { sub: r2 + "...", len: i2 + 3 };
      i2 += 2;
    } else {
      if (i2 + 1 > e2) return { sub: r2 + "...", len: i2 + 3 };
      i2 += 1;
    }
    r2 += t2[n2];
  }
  return { sub: r2 + "...", len: i2 + 3 };
}
function ar(t2) {
  let e2 = "B";
  do {
    if (t2 < 1024) break;
    if (e2 = "KB", (t2 /= 1024) < 1024) break;
    if (e2 = "MB", (t2 /= 1024) < 1024) break;
    if (e2 = "GB", (t2 /= 1024) < 1024) break;
    t2 /= 1024, e2 = "TB";
  } while (0);
  return t2 >= 100 ? `${t2.toFixed(0)} ${e2}` : t2 >= 10 ? `${t2.toFixed(1)} ${e2}` : `${t2.toFixed(2)} ${e2}`;
}
nr.MAX_DATA_CHUNK_SIZE = 10485760;
class or {
  constructor(t2, e2, i2 = void 0) {
    this.lastUpdateTime = 0, this.firstWrite = true, this.speedCnt = 0, this.speedIdx = 0, this.timeArray = new Array(30), this.stepArray = new Array(30), this.writer = t2, this.tmuxPaneColumns = i2 || 0, this.columns = this.tmuxPaneColumns > 1 ? this.tmuxPaneColumns - 1 : e2;
  }
  setTerminalColumns(t2) {
    this.columns = t2, this.tmuxPaneColumns > 0 && (this.tmuxPaneColumns = 0);
  }
  onNum(t2) {
    this.fileCount = t2, this.fileIdx = 0;
  }
  onName(t2) {
    this.fileName = t2, this.fileIdx += 1, this.startTime = Date.now(), this.timeArray[0] = this.startTime, this.stepArray[0] = 0, this.speedCnt = 1, this.speedIdx = 1, this.fileStep = -1;
  }
  onSize(t2) {
    this.fileSize = t2;
  }
  onStep(t2) {
    t2 <= this.fileStep || (this.fileStep = t2, this.showProgress());
  }
  hideCursor() {
    this.writer("\x1B[?25l");
  }
  showCursor() {
    this.writer("\x1B[?25h");
  }
  showProgress() {
    const t2 = Date.now();
    if (t2 - this.lastUpdateTime < 200) return;
    this.lastUpdateTime = t2;
    let e2 = "100%";
    0 != this.fileSize && (e2 = Math.round(100 * this.fileStep / this.fileSize).toString() + "%");
    const i2 = ar(this.fileStep), r2 = this.getSpeed(t2);
    let n2 = "--- B/s", s2 = "--- ETA";
    r2 > 0 && (n2 = ar(r2) + "/s", s2 = (function(t3) {
      let e3 = "";
      t3 >= 3600 && (e3 += Math.floor(t3 / 3600).toString() + ":", t3 %= 3600);
      const i3 = Math.floor(t3 / 60);
      e3 += i3 >= 10 ? i3.toString() : "0" + i3.toString(), e3 += ":";
      const r3 = Math.round(t3 % 60);
      return e3 += r3 >= 10 ? r3.toString() : "0" + r3.toString(), e3;
    })(Math.round((this.fileSize - this.fileStep) / r2)) + " ETA");
    const a2 = this.getProgressText(e2, i2, n2, s2);
    if (this.firstWrite) return this.firstWrite = false, void this.writer(a2);
    this.tmuxPaneColumns > 0 ? this.writer(`\x1B[${this.columns}D${a2}`) : this.writer(`\r${a2}`);
  }
  getSpeed(t2) {
    let e2;
    return this.speedCnt <= 30 ? (this.speedCnt++, e2 = 1e3 * (this.fileStep - this.stepArray[0]) / (t2 - this.timeArray[0])) : e2 = 1e3 * (this.fileStep - this.stepArray[this.speedIdx]) / (t2 - this.timeArray[this.speedIdx]), this.timeArray[this.speedIdx] = t2, this.stepArray[this.speedIdx] = this.fileStep, this.speedIdx++, this.speedIdx >= 30 && (this.speedIdx %= 30), isFinite(e2) ? e2 : -1;
  }
  getProgressText(t2, e2, i2, r2) {
    const n2 = 24;
    let s2 = this.fileCount > 1 ? `(${this.fileIdx}/${this.fileCount}) ${this.fileName}` : this.fileName, a2 = s2.replace(/[\u4e00-\u9fa5]/g, "**").length;
    let o2 = ` ${t2} | ${e2} | ${i2} | ${r2}`;
    do {
      if (this.columns - a2 - o2.length >= n2) break;
      if (a2 > 50 && ({ sub: s2, len: a2 } = sr(s2, 50)), this.columns - a2 - o2.length >= n2) break;
      if (a2 > 40 && ({ sub: s2, len: a2 } = sr(s2, 40)), this.columns - a2 - o2.length >= n2) break;
      if (o2 = ` ${t2} | ${i2} | ${r2}`, this.columns - a2 - o2.length >= n2) break;
      if (a2 > 30 && ({ sub: s2, len: a2 } = sr(s2, 30)), this.columns - a2 - o2.length >= n2) break;
      if (o2 = ` ${t2} | ${r2}`, this.columns - a2 - o2.length >= n2) break;
      if (o2 = ` ${t2}`, this.columns - a2 - o2.length >= n2) break;
      if (a2 > 20 && ({ sub: s2, len: a2 } = sr(s2, 20)), this.columns - a2 - o2.length >= n2) break;
      s2 = "", a2 = 0;
    } while (0);
    let l2 = this.columns - o2.length;
    a2 > 0 && (l2 -= a2 + 1, s2 += " ");
    return (s2 + this.getProgressBar(l2) + o2).trim();
  }
  getProgressBar(t2) {
    if (t2 < 12) return "";
    const e2 = t2 - 2;
    let i2 = e2;
    return 0 != this.fileSize && (i2 = Math.round(e2 * this.fileStep / this.fileSize)), "[\x1B[36m" + "█".repeat(i2) + "░".repeat(e2 - i2) + "\x1B[0m]";
  }
  onDone() {
    0 != this.fileSize && (this.fileStep = this.fileSize, this.lastUpdateTime = 0, this.showProgress());
  }
}
function lr(e2, i2, r2, n2) {
  return t(this, void 0, void 0, function* () {
    i2.isFile ? yield new Promise((t2) => {
      i2.file((i3) => {
        r2.push(new Hi(e2, n2, i3, false)), t2();
      });
    }) : i2.isDirectory && (r2.push(new Hi(e2, n2, null, true)), yield new Promise((s2) => {
      i2.createReader().readEntries((i3) => t(this, void 0, void 0, function* () {
        for (const t2 of i3) yield lr(e2, t2, r2, [...n2, t2.name]);
        s2();
      }));
    }));
  });
}
const hr = "::TRZSZ:TRANSFER:", dr = new RegExp(/::TRZSZ:TRANSFER:([SRD]):(\d+\.\d+\.\d+)(:\d+)?/), ur = new Float64Array(zi(hr).buffer, 0, 2);
class fr {
  constructor(t2) {
    if (this.trzszTransfer = null, this.textProgressBar = null, this.uniqueIdMaps = /* @__PURE__ */ new Map(), this.uploadFilesList = null, this.uploadFilesResolve = null, this.uploadFilesReject = null, this.uploadInterrupting = false, this.uploadSkipTrzCommand = false, !t2) throw new Ii("TrzszOptions is required");
    if (!t2.writeToTerminal) throw new Ii("TrzszOptions.writeToTerminal is required");
    if (this.writeToTerminal = t2.writeToTerminal, !t2.sendToServer) throw new Ii("TrzszOptions.sendToServer is required");
    if (this.sendToServer = t2.sendToServer, !xi && !t2.chooseSendFiles) throw new Ii("TrzszOptions.chooseSendFiles is required when having a node runtime environment");
    if (this.chooseSendFiles = t2.chooseSendFiles, !xi && !t2.chooseSaveDirectory) throw new Ii("TrzszOptions.chooseSaveDirectory is required when having a node runtime environment");
    this.chooseSaveDirectory = t2.chooseSaveDirectory, this.terminalColumns = t2.terminalColumns || 80, this.isWindowsShell = !!t2.isWindowsShell, this.maxDataChunkSize = t2.maxDataChunkSize, this.dragInitTimeout = t2.dragInitTimeout || 3e3;
  }
  processServerOutput(t2) {
    if (this.isTransferringFiles()) this.trzszTransfer.addReceivedData(t2);
    else if (!this.uploadInterrupting) {
      if (this.uploadSkipTrzCommand) {
        this.uploadSkipTrzCommand = false;
        const e2 = (function(t3) {
          let e3;
          if ("string" == typeof t3) e3 = zi(t3);
          else if (t3 instanceof ArrayBuffer) e3 = new Uint8Array(t3);
          else {
            if (!(t3 instanceof Uint8Array)) return t3;
            e3 = t3;
          }
          const i2 = new Uint8Array(e3.length);
          let r2 = false, n2 = 0;
          for (let t4 = 0; t4 < e3.length; t4++) {
            const s3 = e3[t4];
            r2 ? Ei(s3) && (r2 = false) : 27 == s3 ? r2 = true : i2[n2++] = s3;
          }
          for (; n2 > 0; ) {
            const t4 = i2[n2 - 1];
            if (13 != t4 && 10 != t4) break;
            n2--;
          }
          const s2 = i2.subarray(0, n2);
          return s2.length > 100 ? t3 : String.fromCharCode.apply(null, s2);
        })(t2);
        if ("trz" === e2 || "trz -d" === e2) return void this.writeToTerminal("\r\n");
      }
      setTimeout(() => this.detectAndHandleTrzsz(t2), 10), this.writeToTerminal(t2);
    }
  }
  processTerminalInput(t2) {
    this.isTransferringFiles() ? "" === t2 && this.stopTransferringFiles() : this.sendToServer(t2);
  }
  processBinaryInput(t2) {
    this.isTransferringFiles() || this.sendToServer(zi(t2));
  }
  setTerminalColumns(t2) {
    this.terminalColumns = t2, null != this.textProgressBar && this.textProgressBar.setTerminalColumns(t2);
  }
  isTransferringFiles() {
    return null != this.trzszTransfer;
  }
  stopTransferringFiles() {
    this.isTransferringFiles() && this.trzszTransfer.stopTransferring();
  }
  uploadFiles(e2) {
    return t(this, void 0, void 0, function* () {
      if (this.uploadFilesList || this.isTransferringFiles()) throw new Error("The previous upload has not been completed yet");
      if (!xi && (function(t2, e3) {
        if (!Array.isArray(t2)) return false;
        for (const i3 of t2) if (typeof i3 !== e3) return false;
        return true;
      })(e2, "string")) this.uploadFilesList = yield Pi(e2, true);
      else {
        if (!("undefined" != typeof DataTransferItemList && e2 instanceof DataTransferItemList)) throw new Error("The upload items type is not supported");
        this.uploadFilesList = yield (function(e3) {
          return t(this, void 0, void 0, function* () {
            const t2 = [], i3 = [];
            for (const t3 of e3) i3.push(t3.webkitGetAsEntry());
            for (let e4 = 0; e4 < i3.length; e4++) {
              const r2 = i3[e4];
              r2 && (yield lr(e4, r2, t2, [r2.name]));
            }
            return t2;
          });
        })(e2);
      }
      if (!this.uploadFilesList || !this.uploadFilesList.length) throw this.uploadFilesList = null, new Error("No files to upload");
      let i2 = false;
      for (const t2 of this.uploadFilesList) if (t2.isDir() || t2.getRelPath().length > 1) {
        i2 = true;
        break;
      }
      return this.uploadInterrupting = true, this.sendToServer(""), yield new Promise((t2) => setTimeout(t2, 200)), this.uploadInterrupting = false, this.uploadSkipTrzCommand = true, this.sendToServer(i2 ? "trz -d\r" : "trz\r"), setTimeout(() => {
        this.uploadFilesList && (this.uploadFilesList = null, this.uploadFilesResolve = null, this.uploadFilesReject && (this.uploadFilesReject("Upload does not start"), this.uploadFilesReject = null));
      }, this.dragInitTimeout), new Promise((t2, e3) => {
        this.uploadFilesResolve = t2, this.uploadFilesReject = e3;
      });
    });
  }
  uniqueIdExists(t2) {
    if (t2.length < 8) return false;
    if (!this.isWindowsShell && 14 == t2.length && t2.endsWith("00")) return false;
    if (this.uniqueIdMaps.has(t2)) return true;
    if (this.uniqueIdMaps.size >= 100) {
      const t3 = /* @__PURE__ */ new Map();
      for (const [e2, i2] of this.uniqueIdMaps) i2 >= 50 && t3.set(e2, i2 - 50);
      this.uniqueIdMaps = t3;
    }
    return this.uniqueIdMaps.set(t2, this.uniqueIdMaps.size), false;
  }
  detectAndHandleTrzsz(e2) {
    return t(this, void 0, void 0, function* () {
      const i2 = yield (function(e3) {
        return t(this, void 0, void 0, function* () {
          if ("string" == typeof e3) {
            const t3 = e3.lastIndexOf(hr);
            return t3 < 0 ? null : e3.substring(t3);
          }
          let t2;
          if (e3 instanceof ArrayBuffer) t2 = new Uint8Array(e3);
          else if (e3 instanceof Uint8Array) t2 = e3;
          else {
            if (!(e3 instanceof Blob)) return null;
            t2 = new Uint8Array(yield e3.arrayBuffer());
          }
          if (t2.length < 26) return null;
          let i3 = -1, r3 = -1;
          for (; ; ) {
            if (i3 = t2.indexOf(58, i3 + 1), i3 < 0 || t2.length - i3 < 26) return r3 >= 0 ? Ai(t2.subarray(r3)) : null;
            const e4 = new Float64Array(t2.buffer.slice(t2.byteOffset + i3, t2.byteOffset + i3 + 16));
            e4[0] == ur[0] && e4[1] == ur[1] && (r3 = i3, i3 += 25);
          }
        });
      })(e2);
      if (!i2) return;
      const r2 = i2.match(dr);
      if (!r2) return;
      const n2 = r2.length > 3 ? r2[3] : "";
      if (this.uniqueIdExists(n2)) return;
      const s2 = r2[1], a2 = r2[2];
      let o2 = false;
      (":1" == n2 || 14 == n2.length && n2.endsWith("10")) && (o2 = true);
      try {
        this.trzszTransfer = new nr(this.sendToServer, this.isWindowsShell, this.maxDataChunkSize), "S" === s2 ? yield this.handleTrzszDownloadFiles(a2, o2) : "R" === s2 ? yield this.handleTrzszUploadFiles(a2, false, o2) : "D" === s2 && (yield this.handleTrzszUploadFiles(a2, true, o2)), this.uploadFilesResolve && this.uploadFilesResolve();
      } catch (t2) {
        yield this.trzszTransfer.clientError(t2), this.uploadFilesReject && this.uploadFilesReject(t2);
      } finally {
        this.uploadFilesResolve = null, this.uploadFilesReject = null, this.trzszTransfer.cleanup(), this.textProgressBar && this.textProgressBar.showCursor(), this.textProgressBar = null, this.trzszTransfer = null;
      }
    });
  }
  createProgressBar(t2, e2) {
    true !== t2 ? (this.textProgressBar = new or(this.writeToTerminal, this.terminalColumns, e2), this.textProgressBar.hideCursor()) : this.textProgressBar = null;
  }
  handleTrzszDownloadFiles(e2, i2) {
    return t(this, void 0, void 0, function* () {
      let e3, r2, n2;
      if (xi) {
        const s3 = yield (function() {
          return t(this, void 0, void 0, function* () {
            if ("function" != typeof window.showDirectoryPicker) throw qi();
            try {
              return yield window.showDirectoryPicker({ id: "trzsz_download", startIn: "downloads", mode: "readwrite" });
            } catch (t2) {
              if ("AbortError" === t2.name) return;
              throw t2;
            }
          });
        })();
        if (!s3) return void (yield this.trzszTransfer.sendAction(false, i2));
        e3 = s3.name, r2 = { handle: s3, maps: /* @__PURE__ */ new Map() }, n2 = Qi;
      } else {
        if (e3 = yield this.chooseSaveDirectory(), !e3) return void (yield this.trzszTransfer.sendAction(false, i2));
        yield (function(e4) {
          return t(this, void 0, void 0, function* () {
            if (!e4) return false;
            if (!(yield Di.accessAsync(e4))) throw new Ii(`No such directory: ${e4}`);
            if (!(yield Di.statAsync(e4)).isDirectory()) throw new Ii(`Not a directory: ${e4}`);
            if (!(yield Di.accessAsync(e4, Di.constants.W_OK))) throw new Ii(`No permission to write: ${e4}`);
            return true;
          });
        })(e3), r2 = { path: e3, maps: /* @__PURE__ */ new Map() }, n2 = ji;
      }
      yield this.trzszTransfer.sendAction(true, i2);
      const s2 = yield this.trzszTransfer.recvConfig();
      this.createProgressBar(s2.quiet, s2.tmux_pane_width);
      const a2 = yield this.trzszTransfer.recvFiles(r2, n2, this.textProgressBar);
      yield this.trzszTransfer.clientExit(Bi(a2, e3));
    });
  }
  handleTrzszUploadFiles(e2, i2, r2) {
    return t(this, void 0, void 0, function* () {
      let e3;
      if (this.uploadFilesList) e3 = this.uploadFilesList, this.uploadFilesList = null;
      else if (xi) e3 = i2 ? yield Ki() : yield (function() {
        return t(this, void 0, void 0, function* () {
          if ("function" != typeof window.showOpenFilePicker) throw qi();
          let t2;
          try {
            t2 = yield window.showOpenFilePicker({ id: "trzsz_upload", startIn: "documents", multiple: true });
          } catch (t3) {
            if ("AbortError" === t3.name) return;
            throw t3;
          }
          if (!t2 || !t2.length) return;
          const e4 = [];
          for (const [i3, r3] of t2.entries()) {
            const t3 = yield r3.getFile();
            e4.push(new Hi(i3, [t3.name], t3, false));
          }
          return e4;
        });
      })();
      else {
        const t2 = yield this.chooseSendFiles(i2);
        e3 = yield Pi(t2, i2);
      }
      if (!e3 || !e3.length) return void (yield this.trzszTransfer.sendAction(false, r2));
      yield this.trzszTransfer.sendAction(true, r2);
      const n2 = yield this.trzszTransfer.recvConfig();
      true === n2.overwrite && (function(t2) {
        const e4 = /* @__PURE__ */ new Set();
        for (const i3 of t2) {
          const t3 = i3.getRelPath().join("/");
          if (e4.has(t3)) throw new Ii(`Duplicate name: ${t3}`);
          e4.add(t3);
        }
      })(e3), this.createProgressBar(n2.quiet, n2.tmux_pane_width);
      const s2 = yield this.trzszTransfer.sendFiles(e3, this.textProgressBar);
      yield this.trzszTransfer.clientExit(Bi(s2, ""));
    });
  }
}
var _class;
function _applyDecoratedDescriptor(i2, e2, r2, n2, l2) {
  var a2 = {};
  return Object.keys(n2).forEach(function(i22) {
    a2[i22] = n2[i22];
  }), a2.enumerable = !!a2.enumerable, a2.configurable = !!a2.configurable, ("value" in a2 || a2.initializer) && (a2.writable = true), a2 = r2.slice().reverse().reduce(function(r22, n22) {
    return n22(i2, e2, r22) || r22;
  }, a2), l2 && void 0 !== a2.initializer && (a2.value = a2.initializer ? a2.initializer.call(l2) : void 0, a2.initializer = void 0), void 0 === a2.initializer ? (Object.defineProperty(i2, e2, a2), null) : a2;
}
let ZmodemAddon = (_class = class ZmodemAddon2 {
  constructor(options) {
    this.disposables = [];
    this.options = options;
  }
  activate(terminal) {
    this.terminal = terminal;
    if (this.options.zmodem) this.zmodemInit();
    if (this.options.trzsz) this.trzszInit();
  }
  dispose() {
    for (const d2 of this.disposables) {
      d2.dispose();
    }
    this.disposables.length = 0;
  }
  consume(data) {
    try {
      if (this.options.trzsz) {
        this.trzszFilter.processServerOutput(data);
      } else {
        this.sentry.consume(data);
      }
    } catch (e2) {
      console.error("[ttyd] zmodem consume: ", e2);
      this.reset();
    }
  }
  reset() {
    this.terminal.options.disableStdin = false;
    this.terminal.focus();
  }
  addDisposableListener(target, type, listener) {
    target.addEventListener(type, listener);
    this.disposables.push({
      dispose: () => target.removeEventListener(type, listener)
    });
  }
  trzszInit() {
    const {
      terminal
    } = this;
    const {
      sender,
      writer,
      zmodem: zmodem2
    } = this.options;
    this.trzszFilter = new fr({
      writeToTerminal: (data) => {
        if (!this.trzszFilter.isTransferringFiles() && zmodem2) {
          this.sentry.consume(data);
        } else {
          writer(typeof data === "string" ? data : new Uint8Array(data));
        }
      },
      sendToServer: (data) => sender(data),
      terminalColumns: terminal.cols,
      isWindowsShell: this.options.windows,
      dragInitTimeout: this.options.trzszDragInitTimeout
    });
    const element = terminal.element;
    this.addDisposableListener(element, "dragover", (event) => event.preventDefault());
    this.addDisposableListener(element, "drop", (event) => {
      event.preventDefault();
      this.trzszFilter.uploadFiles(event.dataTransfer?.items).then(() => console.log("[ttyd] upload success")).catch((err) => console.log("[ttyd] upload failed: " + err));
    });
    this.disposables.push(terminal.onResize((size) => this.trzszFilter.setTerminalColumns(size.cols)));
  }
  zmodemInit() {
    const {
      sender,
      writer
    } = this.options;
    const {
      terminal,
      reset,
      zmodemDetect
    } = this;
    this.session = null;
    this.sentry = new zmodem_browserExports.Sentry({
      to_terminal: (octets) => writer(new Uint8Array(octets)),
      sender: (octets) => sender(new Uint8Array(octets)),
      on_retract: () => reset(),
      on_detect: (detection) => zmodemDetect(detection)
    });
    this.disposables.push(terminal.onKey((e2) => {
      const event = e2.domEvent;
      if (event.ctrlKey && event.key === "c") {
        if (this.denier) this.denier();
      }
    }));
  }
  zmodemDetect(detection) {
    const {
      terminal,
      receiveFile
    } = this;
    terminal.options.disableStdin = true;
    this.denier = () => detection.deny();
    this.session = detection.confirm();
    this.session.on("session_end", () => this.reset());
    if (this.session.type === "send") {
      this.options.onSend();
    } else {
      receiveFile();
    }
  }
  sendFile(files) {
    const {
      session,
      writeProgress
    } = this;
    zmodem_browserExports.Browser.send_files(session, files, {
      on_progress: (_2, offer) => writeProgress(offer)
    }).then(() => session.close()).catch(() => this.reset());
  }
  receiveFile() {
    const {
      session,
      writeProgress
    } = this;
    session.on("offer", (offer) => {
      offer.on("input", () => writeProgress(offer));
      offer.accept().then((payloads) => {
        const blob = new Blob(payloads, {
          type: "application/octet-stream"
        });
        FileSaver_minExports.saveAs(blob, offer.get_details().name);
      }).catch(() => this.reset());
    });
    session.start();
  }
  writeProgress(offer) {
    const {
      bytesHuman
    } = this;
    const file = offer.get_details();
    const name2 = file.name;
    const size = file.size;
    const offset = offer.get_offset();
    const percent = (100 * offset / size).toFixed(2);
    this.options.writer(`${name2} ${percent}% ${bytesHuman(offset, 2)}/${bytesHuman(size, 2)}\r`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bytesHuman(bytes, precision) {
    if (!/^([-+])?|(\.\d+)(\d+(\.\d+)?|(\d+\.)|Infinity)$/.test(bytes)) {
      return "-";
    }
    if (bytes === 0) return "0";
    if (typeof precision === "undefined") precision = 1;
    const units = ["bytes", "KB", "MB", "GB", "TB", "PB"];
    const num = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = (bytes / Math.pow(1024, Math.floor(num))).toFixed(precision);
    return `${value} ${units[num]}`;
  }
}, _applyDecoratedDescriptor(_class.prototype, "reset", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "reset"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "trzszInit", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "trzszInit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "zmodemInit", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "zmodemInit"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "zmodemDetect", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "zmodemDetect"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "sendFile", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "sendFile"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "receiveFile", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "receiveFile"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "writeProgress", [deckoExports.bind], Object.getOwnPropertyDescriptor(_class.prototype, "writeProgress"), _class.prototype), _class);
const DEFAULT_THEME = {
  foreground: "#d2d2d2",
  background: "#2b2b2b",
  cursor: "#adadad",
  black: "#000000",
  red: "#ff6a45",
  green: "#5ea702",
  yellow: "#cfae00",
  blue: "#5197dd",
  magenta: "#b283b8",
  cyan: "#00a7aa",
  white: "#dbded8",
  brightBlack: "#91948e",
  brightRed: "#ff5745",
  brightGreen: "#99e343",
  brightYellow: "#fdeb61",
  brightBlue: "#84b0d8",
  brightMagenta: "#bc94b7",
  brightCyan: "#37e6e8",
  brightWhite: "#f1f1f0"
};
const DEFAULT_TERM_OPTIONS = {
  fontSize: 13,
  fontFamily: "Consolas,Liberation Mono,Menlo,Courier,monospace",
  theme: DEFAULT_THEME,
  allowProposedApi: true
};
const DEFAULT_CLIENT_OPTIONS = {
  rendererType: "webgl",
  disableLeaveAlert: false,
  disableResizeOverlay: false,
  enableZmodem: false,
  enableTrzsz: false,
  isWindows: false,
  trzszDragInitTimeout: 0,
  unicodeVersion: "11"
};
const DEFAULT_FLOW_CONTROL = {
  limit: 1e5,
  highWater: 10,
  lowWater: 4
};
const TERMINAL_STATUS_EVENT = "ws-terminal";
function toDisposable(f2) {
  return { dispose: f2 };
}
function addListener(target, type, listener) {
  target.addEventListener(type, listener);
  return toDisposable(() => target.removeEventListener(type, listener));
}
class FrierenTerminal {
  constructor(options) {
    this.disposables = [];
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder();
    this.written = 0;
    this.pending = 0;
    this.fitAddon = new addonFitExports.FitAddon();
    this.overlayAddon = new OverlayAddon();
    this.opened = false;
    this.resizeOverlay = true;
    this.reconnect = true;
    this.doReconnect = true;
    this.writeFunc = (data) => this.writeData(new Uint8Array(data));
    this.register = (d2) => {
      this.disposables.push(d2);
      return d2;
    };
    this.onSocketOpen = () => {
      console.log("[frieren-terminal] websocket connection opened");
      const { textEncoder, terminal, overlayAddon } = this;
      const msg = JSON.stringify({ columns: terminal.cols, rows: terminal.rows });
      this.socket?.send(textEncoder.encode(msg));
      if (this.opened) {
        terminal.reset();
        terminal.options.disableStdin = false;
        overlayAddon.showOverlay("Reconnected", 300);
        this.dispatchStatus("reconnected");
      } else {
        this.opened = true;
        this.dispatchStatus("connected");
      }
      this.doReconnect = this.reconnect;
      this.initListeners();
      terminal.focus();
    };
    this.onSocketClose = (event) => {
      console.log(`[frieren-terminal] websocket connection closed with code: ${event.code}`);
      const { doReconnect, overlayAddon } = this;
      overlayAddon.showOverlay("Connection Closed");
      this.close();
      this.dispatchStatus("disconnected");
      if (event.code !== 1e3 && doReconnect) {
        overlayAddon.showOverlay("Reconnecting...");
        this.connect();
        this.dispatchStatus("reconnecting");
      } else {
        const { terminal, register } = this;
        const keyDispose = register(terminal.onKey((e2) => {
          if (e2.domEvent.key === "Enter") {
            keyDispose.dispose();
            overlayAddon.showOverlay("Reconnecting...");
            this.connect();
          }
        }));
        overlayAddon.showOverlay("Press ⏎ to Reconnect");
      }
    };
    this.onSocketData = (event) => {
      const { textDecoder } = this;
      const rawData = event.data;
      const cmd = String.fromCharCode(new Uint8Array(rawData)[0]);
      const data = rawData.slice(1);
      switch (cmd) {
        case "0":
          this.writeFunc(data);
          break;
        case "1":
          break;
        case "2":
          this.applyPreferences({
            ...this.clientOptions,
            ...JSON.parse(textDecoder.decode(data))
          });
          break;
        default:
          console.warn(`[frieren-terminal] unknown command: ${cmd}`);
          break;
      }
    };
    this.initListeners = () => {
      const { terminal, fitAddon, overlayAddon, register } = this;
      register(terminal.onData((data) => this.sendData(data)));
      register(terminal.onBinary((data) => this.sendData(Uint8Array.from(data, (v2) => v2.charCodeAt(0)))));
      register(
        terminal.onResize(({ cols, rows }) => {
          const msg = JSON.stringify({ columns: cols, rows });
          this.socket?.send(this.textEncoder.encode("1" + msg));
          if (this.resizeOverlay) this.overlayAddon?.showOverlay(`${cols}x${rows}`, 300);
        })
      );
      register(
        terminal.onSelectionChange(() => {
          if (this.terminal.getSelection() === "") return;
          try {
            document.execCommand("copy");
          } catch {
          }
          this.overlayAddon?.showOverlay("✂", 200);
        })
      );
      register(addListener(window, "beforeunload", this.onWindowUnload));
    };
    this.writeData = (data) => {
      const { terminal, textEncoder } = this;
      const { limit, highWater, lowWater } = this.flowControl;
      this.written += data.length;
      if (this.written > limit) {
        terminal.write(data, () => {
          this.pending = Math.max(this.pending - 1, 0);
          if (this.pending < lowWater) {
            this.socket?.send(textEncoder.encode(
              "3"
              /* RESUME */
            ));
          }
        });
        this.pending++;
        this.written = 0;
        if (this.pending > highWater) {
          this.socket?.send(textEncoder.encode(
            "2"
            /* PAUSE */
          ));
        }
      } else {
        terminal.write(data);
      }
    };
    this.sendData = (data) => {
      const { socket, textEncoder } = this;
      if (socket?.readyState !== WebSocket.OPEN) return;
      if (typeof data === "string") {
        const payload = new Uint8Array(data.length * 3 + 1);
        payload[0] = "0".charCodeAt(0);
        const stats = textEncoder.encodeInto(data, payload.subarray(1));
        socket.send(payload.subarray(0, stats.written + 1));
      } else {
        const payload = new Uint8Array(data.length + 1);
        payload[0] = "0".charCodeAt(0);
        payload.set(data, 1);
        socket.send(payload);
      }
    };
    this.onWindowUnload = (event) => {
      event.preventDefault();
      if (this.socket?.readyState === WebSocket.OPEN) {
        const message = "Close terminal? this will also terminate the command.";
        event.returnValue = message;
        return message;
      }
      return void 0;
    };
    this.applyPreferences = (prefs) => {
      const { terminal, fitAddon, register } = this;
      if (prefs.enableZmodem || prefs.enableTrzsz) {
        this.zmodemAddon = new ZmodemAddon({
          zmodem: prefs.enableZmodem,
          trzsz: prefs.enableTrzsz,
          windows: prefs.isWindows,
          trzszDragInitTimeout: prefs.trzszDragInitTimeout,
          onSend: this.sendCb,
          sender: this.sendData,
          writer: this.writeData
        });
        this.writeFunc = (data) => this.zmodemAddon?.consume(data);
        terminal.loadAddon(register(this.zmodemAddon));
      }
      for (const [key, value] of Object.entries(prefs)) {
        switch (key) {
          case "rendererType":
            this.setRendererType(value);
            break;
          case "disableLeaveAlert":
            if (value) {
              window.removeEventListener("beforeunload", this.onWindowUnload);
              console.log("[frieren-terminal] Leave site alert disabled");
            }
            break;
          case "disableResizeOverlay":
            if (value) {
              this.resizeOverlay = false;
            }
            break;
          case "disableReconnect":
            if (value) {
              this.reconnect = false;
              this.doReconnect = false;
            }
            break;
          case "enableZmodem":
          case "enableTrzsz":
          case "trzszDragInitTimeout":
          case "isWindows":
            break;
          case "titleFixed":
            break;
          case "unicodeVersion":
            if (value === 11 || value === "11") {
              terminal.loadAddon(new addonUnicode11Exports.Unicode11Addon());
              terminal.unicode.activeVersion = "11";
            }
            break;
          default:
            const opts = terminal.options;
            if (opts[key] instanceof Object) {
              opts[key] = Object.assign({}, opts[key], value);
            } else {
              opts[key] = value;
            }
            if (key.indexOf("font") === 0) fitAddon.fit();
            break;
        }
      }
    };
    this.wsUrl = options.wsUrl;
    this.clientOptions = { ...DEFAULT_CLIENT_OPTIONS, ...options.clientOptions };
    this.flowControl = { ...DEFAULT_FLOW_CONTROL, ...options.flowControl };
    this.sendCb = options.onSendFile ?? (() => {
    });
    this.statusCb = options.onStatusChange ?? (() => {
    });
    const termOptions = { ...DEFAULT_TERM_OPTIONS, ...options.termOptions };
    this.terminal = new xtermExports.Terminal(termOptions);
  }
  open(parent) {
    const { terminal, fitAddon, overlayAddon } = this;
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(overlayAddon);
    terminal.loadAddon(new addonWebLinksExports.WebLinksAddon());
    terminal.open(parent);
    fitAddon.fit();
  }
  connect() {
    this.socket = new WebSocket(this.wsUrl, ["tty"]);
    const { socket } = this;
    this.dispatchStatus("initializing");
    socket.binaryType = "arraybuffer";
    this.register(addListener(socket, "open", this.onSocketOpen));
    this.register(addListener(socket, "message", this.onSocketData));
    this.register(addListener(socket, "close", this.onSocketClose));
    this.register(addListener(socket, "error", () => this.doReconnect = false));
  }
  fit() {
    this.fitAddon.fit();
  }
  setTheme(theme) {
    this.terminal.options.theme = theme;
  }
  setOptions(options) {
    const { terminal, fitAddon } = this;
    let needsFit = false;
    for (const [key, value] of Object.entries(options)) {
      terminal.options[key] = value;
      if (key.startsWith("font")) {
        needsFit = true;
      }
    }
    if (needsFit) {
      fitAddon.fit();
    }
  }
  close() {
    this.doReconnect = false;
    this.socket?.close(1e3);
    this.socket = void 0;
    for (const d2 of this.disposables) {
      d2.dispose();
    }
    this.disposables.length = 0;
  }
  dispose() {
    this.close();
    this.terminal.dispose();
  }
  sendFile(files) {
    this.zmodemAddon?.sendFile(files);
  }
  setRendererType(value) {
    const { terminal } = this;
    const disposeWebgl = () => {
      try {
        this.webglAddon?.dispose();
      } catch {
      }
      this.webglAddon = void 0;
    };
    const enableWebgl = () => {
      if (this.webglAddon) return;
      this.webglAddon = new addonWebglExports.WebglAddon();
      try {
        this.webglAddon.onContextLoss(() => this.webglAddon?.dispose());
        terminal.loadAddon(this.webglAddon);
      } catch {
        disposeWebgl();
      }
    };
    switch (value) {
      case "canvas":
      case "webgl":
        enableWebgl();
        break;
      case "dom":
        disposeWebgl();
        break;
    }
  }
  dispatchStatus(status) {
    this.statusCb(status);
    window.dispatchEvent(new CustomEvent(TERMINAL_STATUS_EVENT, { detail: { status } }));
  }
}
const withoutCursor = (theme) => ({ ...theme, cursor: "rgba(0, 0, 0, 0)" });
class TerminalLiteViewer {
  constructor(options = {}) {
    this.fitAddon = new addonFitExports.FitAddon();
    this.terminal = new xtermExports.Terminal({
      ...DEFAULT_TERM_OPTIONS,
      disableStdin: true,
      cursorBlink: false,
      cursorInactiveStyle: "none",
      // Log/file output carries bare "\n" (it is not a tty), so map LF -> CRLF
      // or each line keeps the previous line's column (staircase). The
      // interactive FrierenTerminal must NOT do this (it gets real CRLF).
      convertEol: true,
      ...options.termOptions,
      theme: withoutCursor(options.theme ?? DEFAULT_THEME)
    });
    this.terminal.attachCustomKeyEventHandler(() => false);
  }
  open(parent) {
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(parent);
    this.fitAddon.fit();
  }
  /** Append data to the view. */
  write(data) {
    this.terminal.write(data);
  }
  /** Replace the whole view (use for re-read/polled snapshots so nothing stacks). */
  set(data) {
    this.terminal.reset();
    this.terminal.write(data);
  }
  clear() {
    this.terminal.clear();
  }
  fit() {
    this.fitAddon.fit();
  }
  setTheme(theme) {
    this.terminal.options.theme = withoutCursor(theme);
  }
  dispose() {
    this.terminal.dispose();
  }
}
const DRACULA = {
  foreground: "#f8f8f2",
  background: "#282a36",
  cursor: "#f8f8f2",
  selectionBackground: "#44475a",
  black: "#21222c",
  red: "#ff5555",
  green: "#50fa7b",
  yellow: "#f1fa8c",
  blue: "#bd93f9",
  magenta: "#ff79c6",
  cyan: "#8be9fd",
  white: "#f8f8f2",
  brightBlack: "#6272a4",
  brightRed: "#ff6e6e",
  brightGreen: "#69ff94",
  brightYellow: "#ffffa5",
  brightBlue: "#d6acff",
  brightMagenta: "#ff92df",
  brightCyan: "#a4ffff",
  brightWhite: "#ffffff"
};
const NORD = {
  foreground: "#d8dee9",
  background: "#2e3440",
  cursor: "#d8dee9",
  selectionBackground: "#434c5e",
  black: "#3b4252",
  red: "#bf616a",
  green: "#a3be8c",
  yellow: "#ebcb8b",
  blue: "#81a1c1",
  magenta: "#b48ead",
  cyan: "#88c0d0",
  white: "#e5e9f0",
  brightBlack: "#4c566a",
  brightRed: "#bf616a",
  brightGreen: "#a3be8c",
  brightYellow: "#ebcb8b",
  brightBlue: "#81a1c1",
  brightMagenta: "#b48ead",
  brightCyan: "#8fbcbb",
  brightWhite: "#eceff4"
};
const SOLARIZED_DARK = {
  foreground: "#839496",
  background: "#002b36",
  cursor: "#93a1a1",
  selectionBackground: "#073642",
  black: "#073642",
  red: "#dc322f",
  green: "#859900",
  yellow: "#b58900",
  blue: "#268bd2",
  magenta: "#d33682",
  cyan: "#2aa198",
  white: "#eee8d5",
  brightBlack: "#586e75",
  brightRed: "#cb4b16",
  brightGreen: "#586e75",
  brightYellow: "#657b83",
  brightBlue: "#839496",
  brightMagenta: "#6c71c4",
  brightCyan: "#93a1a1",
  brightWhite: "#fdf6e3"
};
const MONOKAI = {
  foreground: "#f8f8f2",
  background: "#272822",
  cursor: "#f8f8f0",
  selectionBackground: "#49483e",
  black: "#272822",
  red: "#f92672",
  green: "#a6e22e",
  yellow: "#f4bf75",
  blue: "#66d9ef",
  magenta: "#ae81ff",
  cyan: "#a1efe4",
  white: "#f8f8f2",
  brightBlack: "#75715e",
  brightRed: "#f92672",
  brightGreen: "#a6e22e",
  brightYellow: "#f4bf75",
  brightBlue: "#66d9ef",
  brightMagenta: "#ae81ff",
  brightCyan: "#a1efe4",
  brightWhite: "#f9f8f5"
};
const GRUVBOX = {
  foreground: "#ebdbb2",
  background: "#282828",
  cursor: "#ebdbb2",
  selectionBackground: "#3c3836",
  black: "#282828",
  red: "#fb4934",
  green: "#98971a",
  yellow: "#d79921",
  blue: "#458588",
  magenta: "#b16286",
  cyan: "#689d6a",
  white: "#a89984",
  brightBlack: "#928374",
  brightRed: "#fb4934",
  brightGreen: "#b8bb26",
  brightYellow: "#fabd2f",
  brightBlue: "#83a598",
  brightMagenta: "#d3869b",
  brightCyan: "#8ec07c",
  brightWhite: "#ebdbb2"
};
const CATPPUCCIN_MOCHA = {
  foreground: "#cdd6f4",
  background: "#1e1e2e",
  cursor: "#f5e0dc",
  selectionBackground: "#45475a",
  black: "#45475a",
  red: "#f38ba8",
  green: "#a6e3a1",
  yellow: "#f9e2af",
  blue: "#89b4fa",
  magenta: "#f5c2e7",
  cyan: "#94e2d5",
  white: "#bac2de",
  brightBlack: "#585b70",
  brightRed: "#f38ba8",
  brightGreen: "#a6e3a1",
  brightYellow: "#f9e2af",
  brightBlue: "#89b4fa",
  brightMagenta: "#f5c2e7",
  brightCyan: "#94e2d5",
  brightWhite: "#a6adc8"
};
const TOKYO_NIGHT = {
  foreground: "#a9b1d6",
  background: "#1a1b26",
  cursor: "#c0caf5",
  selectionBackground: "#33467c",
  black: "#15161e",
  red: "#f7768e",
  green: "#9ece6a",
  yellow: "#e0af68",
  blue: "#7aa2f7",
  magenta: "#bb9af7",
  cyan: "#7dcfff",
  white: "#a9b1d6",
  brightBlack: "#414868",
  brightRed: "#f7768e",
  brightGreen: "#9ece6a",
  brightYellow: "#e0af68",
  brightBlue: "#7aa2f7",
  brightMagenta: "#bb9af7",
  brightCyan: "#7dcfff",
  brightWhite: "#c0caf5"
};
const TERMINAL_THEMES = {
  default: DEFAULT_THEME,
  dracula: DRACULA,
  nord: NORD,
  solarizedDark: SOLARIZED_DARK,
  monokai: MONOKAI,
  gruvbox: GRUVBOX,
  catppuccinMocha: CATPPUCCIN_MOCHA,
  tokyoNight: TOKYO_NIGHT
};
export {
  DEFAULT_CLIENT_OPTIONS,
  DEFAULT_FLOW_CONTROL,
  DEFAULT_TERM_OPTIONS,
  DEFAULT_THEME,
  FrierenTerminal,
  TERMINAL_STATUS_EVENT,
  TERMINAL_THEMES,
  TerminalLiteViewer
};
