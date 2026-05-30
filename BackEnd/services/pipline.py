from services.operations.apply_contrast import apply_contrast
from schemas import Operation
from services.operations.brightness import apply_brightness
from services.operations.edge_detection import apply_edge_detection
from services.operations.histogram_eq import apply_histogram_equalization
from services.operations.histogram_spec import apply_histogram_specification
from services.operations.rotate import apply_rotate
from services.operations.convolution import apply_convolution
from services.operations.flip_operation import apply_flip
from services.operations.zoom import apply_zoom

REGISTRY = {
    "brightness": apply_brightness,
    "edge_detection": apply_edge_detection,
    "histogram_equalization": apply_histogram_equalization,
    "histogram_specification": apply_histogram_specification,
    "rotate": apply_rotate,
    "contrast": apply_contrast,
    "convolution": apply_convolution,
    "flip": apply_flip,
    "zoom": apply_zoom,
}


def apply_pipeline(image,operations : list[Operation]):
    for op in operations:
        if op.type not in REGISTRY:
            raise KeyError(op.type)
        image = REGISTRY[op.type](image, **op.params)
    return image