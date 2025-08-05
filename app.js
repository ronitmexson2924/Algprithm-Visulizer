// Algorithm Visualizer Application
class AlgorithmVisualizer {
    constructor() {
        this.currentCategory = 'sorting';
        this.currentAlgorithm = 'bubble_sort';
        this.currentLanguage = 'java';
        this.array = [];
        this.isPlaying = false;
        this.animationSpeed = 300;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.searchTarget = null;
        this.animationId = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.generateRandomArray();
        this.updateDisplay();
    }

    initializeElements() {
        // Main UI elements
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.algorithmBtns = document.querySelectorAll('.algorithm-btn');
        this.languageSelect = document.querySelector('.language-select');
        this.arraySizeSlider = document.querySelector('.array-size-slider');
        this.arraySizeValue = document.querySelector('.array-size-value');
        this.generateArrayBtn = document.querySelector('.generate-array-btn');
        this.searchInputGroup = document.querySelector('.search-input-group');
        this.searchValueInput = document.querySelector('.search-value-input');
        
        // Control elements
        this.playBtn = document.querySelector('.play-btn');
        this.resetBtn = document.querySelector('.reset-btn');
        this.stepBtn = document.querySelector('.step-btn');
        this.speedSlider = document.querySelector('.speed-slider');
        this.speedValue = document.querySelector('.speed-value');
        
        // Display elements
        this.algorithmTitle = document.querySelector('.algorithm-title');
        this.arrayVisualization = document.getElementById('arrayVisualization');
        this.codeDisplay = document.getElementById('codeDisplay');
        this.timeComplexity = document.querySelector('.time-complexity');
        this.spaceComplexity = document.querySelector('.space-complexity');
        this.descriptionText = document.querySelector('.description-text');
        this.currentStepSpan = document.querySelector('.current-step');
        this.comparisonsSpan = document.querySelector('.comparisons');
        this.swapsSpan = document.querySelector('.swaps');
        
        // Icons
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
    }

    initializeEventListeners() {
        // Category selection
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectCategory(btn.dataset.category);
            });
        });

        // Algorithm selection - use event delegation to handle all algorithm buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('algorithm-btn')) {
                e.preventDefault();
                this.selectAlgorithm(e.target.dataset.algorithm);
            }
        });

        // Language selection
        this.languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateDisplay();
        });

        // Array controls
        this.arraySizeSlider.addEventListener('input', (e) => {
            this.arraySizeValue.textContent = e.target.value;
        });

        this.arraySizeSlider.addEventListener('change', (e) => {
            this.generateRandomArray();
        });

        this.generateArrayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.generateRandomArray();
        });

        // Search input
        this.searchValueInput.addEventListener('input', (e) => {
            this.searchTarget = parseInt(e.target.value) || null;
        });

        // Playback controls
        this.playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePlayback();
        });
        
        this.resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.resetVisualization();
        });
        
        this.stepBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.stepForward();
        });

        // Speed control
        this.speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = 600 - (e.target.value * 50);
            this.speedValue.textContent = e.target.value + 'x';
        });
    }

    selectCategory(category) {
        if (this.currentCategory === category) return;
        
        this.currentCategory = category;
        
        // Update category buttons
        this.categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Show/hide algorithm categories
        document.querySelectorAll('.algorithm-category').forEach(cat => {
            cat.classList.remove('active');
        });
        
        const targetCategory = document.querySelector(`.${category}-algorithms`);
        if (targetCategory) {
            targetCategory.classList.add('active');
        }
        
        // Select first algorithm in category
        const firstAlgorithm = document.querySelector(`.${category}-algorithms .algorithm-btn`);
        if (firstAlgorithm) {
            this.selectAlgorithm(firstAlgorithm.dataset.algorithm);
        }
        
        // Show/hide search input for searching algorithms
        if (this.searchInputGroup) {
            this.searchInputGroup.style.display = category === 'searching' ? 'flex' : 'none';
        }
    }

    selectAlgorithm(algorithm) {
        if (this.currentAlgorithm === algorithm) return;
        
        this.currentAlgorithm = algorithm;
        
        // Update algorithm buttons
        this.algorithmBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === algorithm);
        });
        
        this.resetVisualization();
        this.updateDisplay();
    }

    generateRandomArray() {
        const size = parseInt(this.arraySizeSlider.value);
        this.array = [];
        
        for (let i = 0; i < size; i++) {
            this.array.push(Math.floor(Math.random() * 200) + 10);
        }
        
        this.resetVisualization();
        this.renderArray();
    }

    renderArray() {
        if (!this.arrayVisualization) return;
        
        this.arrayVisualization.innerHTML = '';
        
        if (this.array.length === 0) return;
        
        const maxValue = Math.max(...this.array);
        const containerWidth = this.arrayVisualization.clientWidth || 800;
        const elementWidth = Math.max(15, Math.min(50, (containerWidth - (this.array.length * 2)) / this.array.length));
        
        this.array.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.style.height = `${(value / maxValue) * 220}px`;
            element.style.width = `${elementWidth}px`;
            element.textContent = value;
            element.dataset.index = index;
            this.arrayVisualization.appendChild(element);
        });
    }

    async togglePlayback() {
        if (this.isPlaying) {
            this.pauseAnimation();
        } else {
            await this.startAnimation();
        }
    }

    async startAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.playIcon.style.display = 'none';
        this.pauseIcon.style.display = 'inline';
        
        try {
            if (this.currentCategory === 'sorting') {
                await this.runSortingAnimation();
            } else {
                await this.runSearchingAnimation();
            }
        } catch (error) {
            console.error('Animation error:', error);
        }
        
        this.pauseAnimation();
    }

    pauseAnimation() {
        this.isPlaying = false;
        this.playIcon.style.display = 'inline';
        this.pauseIcon.style.display = 'none';
        
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }

    resetVisualization() {
        this.pauseAnimation();
        this.currentStep = 0;
        this.comparisons = 0;
        this.swaps = 0;
        this.renderArray();
        this.updateStatus();
    }

    stepForward() {
        console.log('Step forward - functionality to be implemented');
    }

    async runSortingAnimation() {
        const sortedArray = [...this.array];
        
        switch (this.currentAlgorithm) {
            case 'bubble_sort':
                await this.bubbleSortAnimation(sortedArray);
                break;
            case 'selection_sort':
                await this.selectionSortAnimation(sortedArray);
                break;
            case 'insertion_sort':
                await this.insertionSortAnimation(sortedArray);
                break;
            case 'merge_sort':
                await this.mergeSortAnimation(sortedArray, 0, sortedArray.length - 1);
                break;
            case 'quick_sort':
                await this.quickSortAnimation(sortedArray, 0, sortedArray.length - 1);
                break;
            default:
                console.log(`${this.currentAlgorithm} animation not fully implemented yet`);
                // Show a simple demonstration
                await this.bubbleSortAnimation(sortedArray);
        }
    }

    async runSearchingAnimation() {
        if (this.searchTarget === null || isNaN(this.searchTarget)) {
            alert('Please enter a valid number to search for');
            return;
        }
        
        switch (this.currentAlgorithm) {
            case 'linear_search':
                await this.linearSearchAnimation();
                break;
            case 'binary_search':
                await this.binarySearchAnimation();
                break;
            default:
                console.log(`${this.currentAlgorithm} animation not fully implemented yet`);
                // Show linear search as default
                await this.linearSearchAnimation();
        }
    }

    async bubbleSortAnimation(arr) {
        const n = arr.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isPlaying) return;
                
                // Highlight comparing elements
                this.highlightElements([j, j + 1], 'comparing');
                this.comparisons++;
                this.updateStatus();
                
                await this.delay(this.animationSpeed);
                
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.swaps++;
                    this.array = [...arr];
                    this.renderArray();
                    
                    await this.delay(this.animationSpeed / 2);
                }
                
                this.clearHighlights();
            }
            
            // Mark element as sorted
            this.highlightElements([n - i - 1], 'sorted');
        }
        
        // Mark first element as sorted
        this.highlightElements([0], 'sorted');
    }

    async selectionSortAnimation(arr) {
        const n = arr.length;
        
        for (let i = 0; i < n - 1; i++) {
            if (!this.isPlaying) return;
            
            let minIdx = i;
            this.highlightElements([i], 'current');
            
            for (let j = i + 1; j < n; j++) {
                if (!this.isPlaying) return;
                
                this.highlightElements([j], 'comparing');
                this.comparisons++;
                this.updateStatus();
                
                await this.delay(this.animationSpeed);
                
                if (arr[j] < arr[minIdx]) {
                    if (minIdx !== i) this.clearElementHighlight(minIdx);
                    minIdx = j;
                    this.highlightElements([minIdx], 'comparing');
                } else {
                    this.clearElementHighlight(j);
                }
            }
            
            if (minIdx !== i) {
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                this.swaps++;
                this.array = [...arr];
                this.renderArray();
                
                await this.delay(this.animationSpeed / 2);
            }
            
            this.clearHighlights();
            this.highlightElements([i], 'sorted');
        }
        
        this.highlightElements([n - 1], 'sorted');
    }

    async insertionSortAnimation(arr) {
        const n = arr.length;
        
        for (let i = 1; i < n; i++) {
            if (!this.isPlaying) return;
            
            let key = arr[i];
            let j = i - 1;
            
            this.highlightElements([i], 'current');
            await this.delay(this.animationSpeed);
            
            while (j >= 0 && arr[j] > key) {
                if (!this.isPlaying) return;
                
                this.highlightElements([j], 'comparing');
                this.comparisons++;
                this.updateStatus();
                
                arr[j + 1] = arr[j];
                this.array = [...arr];
                this.renderArray();
                
                await this.delay(this.animationSpeed);
                j--;
            }
            
            arr[j + 1] = key;
            if (j + 1 !== i) this.swaps++;
            this.array = [...arr];
            this.renderArray();
            
            this.clearHighlights();
        }
        
        // Mark all as sorted
        for (let i = 0; i < n; i++) {
            this.highlightElements([i], 'sorted');
        }
    }

    async mergeSortAnimation(arr, left, right) {
        if (left >= right) return;
        
        const mid = Math.floor((left + right) / 2);
        await this.mergeSortAnimation(arr, left, mid);
        await this.mergeSortAnimation(arr, mid + 1, right);
        await this.mergeAnimation(arr, left, mid, right);
    }

    async mergeAnimation(arr, left, mid, right) {
        if (!this.isPlaying) return;
        
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (!this.isPlaying) return;
            
            this.comparisons++;
            this.updateStatus();
            
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            
            this.array = [...arr];
            this.renderArray();
            this.highlightElements([k], 'current');
            
            await this.delay(this.animationSpeed);
            k++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            this.array = [...arr];
            this.renderArray();
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            this.array = [...arr];
            this.renderArray();
            j++;
            k++;
        }
        
        this.clearHighlights();
    }

    async quickSortAnimation(arr, low, high) {
        if (low < high) {
            const pi = await this.partitionAnimation(arr, low, high);
            await this.quickSortAnimation(arr, low, pi - 1);
            await this.quickSortAnimation(arr, pi + 1, high);
        }
    }

    async partitionAnimation(arr, low, high) {
        if (!this.isPlaying) return high;
        
        const pivot = arr[high];
        this.highlightElements([high], 'pivot');
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (!this.isPlaying) return high;
            
            this.highlightElements([j], 'comparing');
            this.comparisons++;
            this.updateStatus();
            
            await this.delay(this.animationSpeed);
            
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                this.swaps++;
                this.array = [...arr];
                this.renderArray();
            }
            
            this.clearElementHighlight(j);
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.swaps++;
        this.array = [...arr];
        this.renderArray();
        
        this.clearHighlights();
        return i + 1;
    }

    async linearSearchAnimation() {
        for (let i = 0; i < this.array.length; i++) {
            if (!this.isPlaying) return;
            
            this.highlightElements([i], 'comparing');
            this.comparisons++;
            this.updateStatus();
            
            await this.delay(this.animationSpeed);
            
            if (this.array[i] === this.searchTarget) {
                this.highlightElements([i], 'found');
                return;
            }
            
            this.clearElementHighlight(i);
        }
        
        // Element not found
        alert('Element not found in the array');
    }

    async binarySearchAnimation() {
        // First, ensure array is sorted for binary search
        const sortedArray = [...this.array].sort((a, b) => a - b);
        this.array = sortedArray;
        this.renderArray();
        
        await this.delay(this.animationSpeed);
        
        let left = 0;
        let right = this.array.length - 1;
        
        while (left <= right) {
            if (!this.isPlaying) return;
            
            const mid = Math.floor((left + right) / 2);
            
            this.highlightElements([left, right], 'comparing');
            this.highlightElements([mid], 'current');
            this.comparisons++;
            this.updateStatus();
            
            await this.delay(this.animationSpeed);
            
            if (this.array[mid] === this.searchTarget) {
                this.highlightElements([mid], 'found');
                return;
            }
            
            this.clearHighlights();
            
            if (this.array[mid] < this.searchTarget) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        // Element not found
        alert('Element not found in the array');
    }

    highlightElements(indices, className) {
        indices.forEach(index => {
            const element = this.arrayVisualization.children[index];
            if (element) {
                element.classList.add(className);
            }
        });
    }

    clearElementHighlight(index) {
        const element = this.arrayVisualization.children[index];
        if (element) {
            element.classList.remove('comparing', 'current', 'pivot');
        }
    }

    clearHighlights() {
        const elements = this.arrayVisualization.children;
        for (let element of elements) {
            element.classList.remove('comparing', 'current', 'pivot');
        }
    }

    delay(ms) {
        return new Promise(resolve => {
            this.animationId = setTimeout(resolve, ms);
        });
    }

    updateStatus() {
        if (this.currentStepSpan) this.currentStepSpan.textContent = `Step: ${this.currentStep}`;
        if (this.comparisonsSpan) this.comparisonsSpan.textContent = `Comparisons: ${this.comparisons}`;
        if (this.swapsSpan) this.swapsSpan.textContent = `Swaps: ${this.swaps}`;
    }

    updateDisplay() {
        const algorithmData = this.getAlgorithmData();
        
        if (!algorithmData) return;
        
        // Update algorithm title
        if (this.algorithmTitle) {
            this.algorithmTitle.textContent = algorithmData.name;
        }
        
        // Update complexity information
        if (this.timeComplexity) {
            this.timeComplexity.textContent = algorithmData.time_complexity;
        }
        if (this.spaceComplexity) {
            this.spaceComplexity.textContent = algorithmData.space_complexity;
        }
        
        // Update description
        if (this.descriptionText) {
            this.descriptionText.textContent = algorithmData.description;
        }
        
        // Update code display
        if (this.codeDisplay) {
            const code = this.getCodeImplementation();
            this.codeDisplay.innerHTML = `<code>${this.escapeHtml(code)}</code>`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getAlgorithmData() {
        const algorithms = {
            sorting: {
                bubble_sort: {
                    name: "Bubble Sort",
                    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
                    time_complexity: "O(n²)",
                    space_complexity: "O(1)"
                },
                selection_sort: {
                    name: "Selection Sort",
                    description: "Finds the minimum element and places it at the beginning, then repeats for the remaining unsorted portion.",
                    time_complexity: "O(n²)",
                    space_complexity: "O(1)"
                },
                insertion_sort: {
                    name: "Insertion Sort",
                    description: "Builds the final sorted array one item at a time by inserting each element into its correct position.",
                    time_complexity: "O(n²)",
                    space_complexity: "O(1)"
                },
                merge_sort: {
                    name: "Merge Sort",
                    description: "Divides the array into halves, sorts them separately, and then merges the sorted halves.",
                    time_complexity: "O(n log n)",
                    space_complexity: "O(n)"
                },
                quick_sort: {
                    name: "Quick Sort",
                    description: "Selects a pivot element and partitions the array around it, then recursively sorts the sub-arrays.",
                    time_complexity: "O(n log n) avg, O(n²) worst",
                    space_complexity: "O(log n)"
                },
                heap_sort: {
                    name: "Heap Sort",
                    description: "Builds a max heap from the array and repeatedly extracts the maximum element.",
                    time_complexity: "O(n log n)",
                    space_complexity: "O(1)"
                },
                counting_sort: {
                    name: "Counting Sort",
                    description: "Counts the frequency of each element and uses this information to place elements in sorted order.",
                    time_complexity: "O(n + k)",
                    space_complexity: "O(k)"
                },
                radix_sort: {
                    name: "Radix Sort",
                    description: "Sorts numbers digit by digit starting from the least significant digit.",
                    time_complexity: "O(d × (n + k))",
                    space_complexity: "O(n + k)"
                },
                bucket_sort: {
                    name: "Bucket Sort",
                    description: "Distributes elements into buckets, sorts each bucket, then concatenates the results.",
                    time_complexity: "O(n + k) avg",
                    space_complexity: "O(n × k)"
                }
            },
            searching: {
                linear_search: {
                    name: "Linear Search",
                    description: "Sequentially checks each element until the target is found or the list ends.",
                    time_complexity: "O(n)",
                    space_complexity: "O(1)"
                },
                binary_search: {
                    name: "Binary Search",
                    description: "Efficiently searches a sorted array by repeatedly dividing the search interval in half.",
                    time_complexity: "O(log n)",
                    space_complexity: "O(1)"
                },
                jump_search: {
                    name: "Jump Search",
                    description: "Jumps ahead by fixed steps to find the range, then performs linear search within that range.",
                    time_complexity: "O(√n)",
                    space_complexity: "O(1)"
                },
                exponential_search: {
                    name: "Exponential Search",
                    description: "Finds the range by exponentially increasing the step size, then performs binary search.",
                    time_complexity: "O(log n)",
                    space_complexity: "O(1)"
                },
                interpolation_search: {
                    name: "Interpolation Search",
                    description: "Estimates the position of the target based on the value distribution in a uniformly distributed array.",
                    time_complexity: "O(log log n) avg",
                    space_complexity: "O(1)"
                }
            }
        };
        
        return algorithms[this.currentCategory]?.[this.currentAlgorithm];
    }

    getCodeImplementation() {
        const codes = {
            java: {
                bubble_sort: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap arr[j] and arr[j+1]
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
                selection_sort: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // Swap the found minimum element with first element
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
                insertion_sort: `public static void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
                merge_sort: `public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
    }
}

public static void merge(int[] arr, int left, int mid, int right) {
    int[] leftArr = Arrays.copyOfRange(arr, left, mid + 1);
    int[] rightArr = Arrays.copyOfRange(arr, mid + 1, right + 1);
    
    int i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    
    while (i < leftArr.length) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }
    
    while (j < rightArr.length) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}`,
                quick_sort: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

public static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}`,
                heap_sort: `public static void heapSort(int[] arr) {
    int n = arr.length;
    
    // Build heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    
    // One by one extract an element from heap
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        
        // call max heapify on the reduced heap
        heapify(arr, i, 0);
    }
}

static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    
    if (l < n && arr[l] > arr[largest])
        largest = l;
    
    if (r < n && arr[r] > arr[largest])
        largest = r;
    
    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        
        heapify(arr, n, largest);
    }
}`,
                counting_sort: `public static void countingSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    int min = Arrays.stream(arr).min().getAsInt();
    int range = max - min + 1;
    
    int[] count = new int[range];
    int[] output = new int[arr.length];
    
    for (int i = 0; i < arr.length; i++)
        count[arr[i] - min]++;
    
    for (int i = 1; i < count.length; i++)
        count[i] += count[i - 1];
    
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i] - min] - 1] = arr[i];
        count[arr[i] - min]--;
    }
    
    for (int i = 0; i < arr.length; i++)
        arr[i] = output[i];
}`,
                radix_sort: `public static void radixSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    
    for (int exp = 1; max / exp > 0; exp *= 10)
        countSort(arr, exp);
}

static void countSort(int[] arr, int exp) {
    int[] output = new int[arr.length];
    int[] count = new int[10];
    
    for (int i = 0; i < arr.length; i++)
        count[(arr[i] / exp) % 10]++;
    
    for (int i = 1; i < 10; i++)
        count[i] += count[i - 1];
    
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    
    for (int i = 0; i < arr.length; i++)
        arr[i] = output[i];
}`,
                bucket_sort: `public static void bucketSort(float[] arr) {
    int n = arr.length;
    
    // Create empty buckets
    List<Float>[] buckets = new List[n];
    for (int i = 0; i < n; i++)
        buckets[i] = new ArrayList<>();
    
    // Put array elements in different buckets
    for (int i = 0; i < n; i++) {
        int bi = (int) (n * arr[i]);
        buckets[bi].add(arr[i]);
    }
    
    // Sort individual buckets
    for (int i = 0; i < n; i++)
        Collections.sort(buckets[i]);
    
    // Concatenate all buckets into arr[]
    int index = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < buckets[i].size(); j++)
            arr[index++] = buckets[i].get(j);
}`,
                linear_search: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i; // Element found at index i
        }
    }
    return -1; // Element not found
}`,
                binary_search: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1; // Element not found
}`,
                jump_search: `public static int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.floor(Math.sqrt(n));
    int prev = 0;
    
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += (int) Math.floor(Math.sqrt(n));
        if (prev >= n)
            return -1;
    }
    
    while (arr[prev] < target) {
        prev++;
        if (prev == Math.min(step, n))
            return -1;
    }
    
    if (arr[prev] == target)
        return prev;
    
    return -1;
}`,
                exponential_search: `public static int exponentialSearch(int[] arr, int target) {
    if (arr[0] == target)
        return 0;
    
    int i = 1;
    while (i < arr.length && arr[i] <= target)
        i = i * 2;
    
    return binarySearch(arr, target, i / 2, 
                       Math.min(i, arr.length - 1));
}

static int binarySearch(int[] arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target)
            return mid;
        
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;
}`,
                interpolation_search: `public static int interpolationSearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        if (left == right) {
            if (arr[left] == target) return left;
            return -1;
        }
        
        int pos = left + (((target - arr[left]) * (right - left)) / 
                         (arr[right] - arr[left]));
        
        if (arr[pos] == target)
            return pos;
        
        if (arr[pos] < target)
            left = pos + 1;
        else
            right = pos - 1;
    }
    return -1;
}`
            },
            cpp: {
                bubble_sort: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap arr[j] and arr[j+1]
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
                selection_sort: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // Swap the found minimum element with first element
        swap(arr[minIdx], arr[i]);
    }
}`,
                insertion_sort: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
                merge_sort: `void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
    }
}

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
    
    int i = 0, j = 0, k = left;
    
    while (i < leftArr.size() && j < rightArr.size()) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    
    while (i < leftArr.size()) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }
    
    while (j < rightArr.size()) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}`,
                quick_sort: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}`,
                heap_sort: `void heapSort(vector<int>& arr) {
    int n = arr.size();
    
    // Build heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    
    // One by one extract an element from heap
    for (int i = n - 1; i > 0; i--) {
        // Move current root to end
        swap(arr[0], arr[i]);
        
        // call max heapify on the reduced heap
        heapify(arr, i, 0);
    }
}

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    
    if (l < n && arr[l] > arr[largest])
        largest = l;
    
    if (r < n && arr[r] > arr[largest])
        largest = r;
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
                counting_sort: `void countingSort(vector<int>& arr) {
    int max = *max_element(arr.begin(), arr.end());
    int min = *min_element(arr.begin(), arr.end());
    int range = max - min + 1;
    
    vector<int> count(range), output(arr.size());
    
    for (int i = 0; i < arr.size(); i++)
        count[arr[i] - min]++;
    
    for (int i = 1; i < count.size(); i++)
        count[i] += count[i - 1];
    
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i] - min] - 1] = arr[i];
        count[arr[i] - min]--;
    }
    
    for (int i = 0; i < arr.size(); i++)
        arr[i] = output[i];
}`,
                radix_sort: `void radixSort(vector<int>& arr) {
    int max = *max_element(arr.begin(), arr.end());
    
    for (int exp = 1; max / exp > 0; exp *= 10)
        countSort(arr, exp);
}

void countSort(vector<int>& arr, int exp) {
    vector<int> output(arr.size());
    int count[10] = {0};
    
    for (int i = 0; i < arr.size(); i++)
        count[(arr[i] / exp) % 10]++;
    
    for (int i = 1; i < 10; i++)
        count[i] += count[i - 1];
    
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    
    for (int i = 0; i < arr.size(); i++)
        arr[i] = output[i];
}`,
                bucket_sort: `void bucketSort(vector<float>& arr) {
    int n = arr.size();
    
    // Create empty buckets
    vector<vector<float>> buckets(n);
    
    // Put array elements in different buckets
    for (int i = 0; i < n; i++) {
        int bi = n * arr[i];
        buckets[bi].push_back(arr[i]);
    }
    
    // Sort individual buckets
    for (int i = 0; i < n; i++)
        sort(buckets[i].begin(), buckets[i].end());
    
    // Concatenate all buckets into arr[]
    int index = 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < buckets[i].size(); j++)
            arr[index++] = buckets[i][j];
}`,
                linear_search: `int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i; // Element found at index i
        }
    }
    return -1; // Element not found
}`,
                binary_search: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1; // Element not found
}`,
                jump_search: `int jumpSearch(vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        if (prev >= n)
            return -1;
    }
    
    while (arr[prev] < target) {
        prev++;
        if (prev == min(step, n))
            return -1;
    }
    
    if (arr[prev] == target)
        return prev;
    
    return -1;
}`,
                exponential_search: `int exponentialSearch(vector<int>& arr, int target) {
    if (arr[0] == target)
        return 0;
    
    int i = 1;
    while (i < arr.size() && arr[i] <= target)
        i = i * 2;
    
    return binarySearch(arr, target, i / 2, 
                       min(i, (int)arr.size() - 1));
}

int binarySearch(vector<int>& arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target)
            return mid;
        
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;
}`,
                interpolation_search: `int interpolationSearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        if (left == right) {
            if (arr[left] == target) return left;
            return -1;
        }
        
        int pos = left + (((double)(target - arr[left]) / 
                         (arr[right] - arr[left])) * (right - left));
        
        if (arr[pos] == target)
            return pos;
        
        if (arr[pos] < target)
            left = pos + 1;
        else
            right = pos - 1;
    }
    return -1;
}`
            },
            python: {
                bubble_sort: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Swap arr[j] and arr[j+1]
                arr[j], arr[j + 1] = arr[j + 1], arr[j]`,
                selection_sort: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        # Swap the found minimum element with first element
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
                insertion_sort: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
                merge_sort: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        left_half = arr[:mid]
        right_half = arr[mid:]
        
        merge_sort(left_half)
        merge_sort(right_half)
        
        i = j = k = 0
        
        while i < len(left_half) and j < len(right_half):
            if left_half[i] <= right_half[j]:
                arr[k] = left_half[i]
                i += 1
            else:
                arr[k] = right_half[j]
                j += 1
            k += 1
        
        while i < len(left_half):
            arr[k] = left_half[i]
            i += 1
            k += 1
        
        while j < len(right_half):
            arr[k] = right_half[j]
            j += 1
            k += 1`,
                quick_sort: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
                heap_sort: `def heap_sort(arr):
    n = len(arr)
    
    # Build a maxheap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # One by one extract elements
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest = i
    l = 2 * i + 1
    r = 2 * i + 2
    
    if l < n and arr[i] < arr[l]:
        largest = l
    
    if r < n and arr[largest] < arr[r]:
        largest = r
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
                counting_sort: `def counting_sort(arr):
    max_val = max(arr)
    min_val = min(arr)
    range_val = max_val - min_val + 1
    
    count = [0] * range_val
    output = [0] * len(arr)
    
    for i in range(len(arr)):
        count[arr[i] - min_val] += 1
    
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i] - min_val] - 1] = arr[i]
        count[arr[i] - min_val] -= 1
    
    for i in range(len(arr)):
        arr[i] = output[i]`,
                radix_sort: `def radix_sort(arr):
    max_val = max(arr)
    
    exp = 1
    while max_val // exp > 0:
        counting_sort_for_radix(arr, exp)
        exp *= 10

def counting_sort_for_radix(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    for i in range(n):
        index = arr[i] // exp
        count[index % 10] += 1
    
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    i = n - 1
    while i >= 0:
        index = arr[i] // exp
        output[count[index % 10] - 1] = arr[i]
        count[index % 10] -= 1
        i -= 1
    
    for i in range(len(arr)):
        arr[i] = output[i]`,
                bucket_sort: `def bucket_sort(arr):
    if len(arr) == 0:
        return
    
    # Create n empty buckets
    bucket = []
    slot_num = 10  # 10 buckets for simplicity
    
    for i in range(slot_num):
        bucket.append([])
    
    # Put array elements in different buckets
    for j in arr:
        index_b = int(slot_num * j)
        bucket[index_b].append(j)
    
    # Sort individual buckets
    for i in range(slot_num):
        bucket[i] = sorted(bucket[i])
    
    # Concatenate the result
    k = 0
    for i in range(slot_num):
        for j in range(len(bucket[i])):
            arr[k] = bucket[i][j]
            k += 1`,
                linear_search: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Element found at index i
    return -1  # Element not found`,
                binary_search: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Element not found`,
                jump_search: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    
    if arr[prev] == target:
        return prev
    
    return -1`,
                exponential_search: `def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    
    i = 1
    while i < len(arr) and arr[i] <= target:
        i = i * 2
    
    return binary_search_range(arr, target, i // 2, 
                              min(i, len(arr) - 1))

def binary_search_range(arr, target, left, right):
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1`,
                interpolation_search: `def interpolation_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right and target >= arr[left] and target <= arr[right]:
        if left == right:
            if arr[left] == target:
                return left
            return -1
        
        # Calculate position
        pos = left + int(((float(target - arr[left]) /
                         (arr[right] - arr[left])) * (right - left)))
        
        if arr[pos] == target:
            return pos
        
        if arr[pos] < target:
            left = pos + 1
        else:
            right = pos - 1
    
    return -1`
            }
        };
        
        return codes[this.currentLanguage]?.[this.currentAlgorithm] || 'Implementation not available for this combination';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlgorithmVisualizer();
});
