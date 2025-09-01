import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
import multiprocessing as mp

class simpleCNN(nn.Module):
    def __int__(self):
        super(simpleCNN, self).__int__()
        self.conv1 = nn.Conv2d(3,32,kernel_size=3,padding=1)
