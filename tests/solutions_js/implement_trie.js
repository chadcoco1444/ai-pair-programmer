class Trie {
  constructor() {
    this.root = {};
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node[char]) node[char] = {};
      node = node[char];
    }
    node._end = true;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node[char]) return false;
      node = node[char];
    }
    return node._end === true;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node[char]) return false;
      node = node[char];
    }
    return true;
  }
}
