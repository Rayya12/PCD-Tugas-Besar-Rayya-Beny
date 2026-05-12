
def apply_pipline(image,operations):
    for op in operations:
        image = REGISTRY[op.type](image,**op.params)
    return image
        