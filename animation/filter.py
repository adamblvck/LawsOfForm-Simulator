import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load the dataset
file_path = 'metrics (15).csv'  # Replace with your file path
data = pd.read_csv(file_path)
data.columns = data.columns.str.strip()

class InteractivePlot:
    def __init__(self, data):
        self.data = data
        self.filtered_data = data.copy()
        self.fig, self.ax = plt.subplots(figsize=(10, 6))
        self.scatter = self.ax.scatter(data['Entropy'], data['Assembly'], alpha=0.5)
        self.cid = self.fig.canvas.mpl_connect('button_press_event', self.onclick)
        self.rect = None
        self.selection = []

        self.ax.set_title('Entropy vs Assembly (Interactive)')
        self.ax.set_xlabel('Entropy')
        self.ax.set_ylabel('Assembly')
        self.ax.grid(True)
        plt.show()

    def onclick(self, event):
        if event.dblclick:
            self.selection.append((event.xdata, event.ydata))
            if len(self.selection) == 2:
                self.select_range()
                self.selection = []

    def select_range(self):
        x_min, x_max = sorted([self.selection[0][0], self.selection[1][0]])
        y_min, y_max = sorted([self.selection[0][1], self.selection[1][1]])
        self.filtered_data = self.filtered_data[~((self.filtered_data['Entropy'] >= x_min) & (self.filtered_data['Entropy'] <= x_max) &
                                                  (self.filtered_data['Assembly'] >= y_min) & (self.filtered_data['Assembly'] <= y_max))]
        self.update_plot()

    def update_plot(self):
        self.ax.clear()
        self.ax.scatter(self.filtered_data['Entropy'], self.filtered_data['Assembly'], alpha=0.5)
        self.ax.set_title('Entropy vs Assembly (Interactive)')
        self.ax.set_xlabel('Entropy')
        self.ax.set_ylabel('Assembly')
        self.ax.grid(True)
        plt.draw()

    def save_filtered_data(self, output_path):
        self.filtered_data.to_csv(output_path, index=False)

# Create the interactive plot
interactive_plot = InteractivePlot(data)

# After interacting with the plot, save the filtered data
# Use a separate cell to save the data after interaction
