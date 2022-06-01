import { computed } from "vue";

export function useFlexStyle(props, type) {
    let flexStyle = computed(() => {
        return props.maxOrder === props.options.order[type] ? "1" : `0 0 ${String(props.options.size[type])}%`;
    });
    let orderStyle = computed(() => {
        return String(props.options.order[type]);
    });
    // 控制左右对齐
    let justifyContentStyle = computed(() => {
        return props.options.align === "right" ? "flex-end" : "flex-start";
    });
    // 控制左右对齐
    let textAlignStyle = computed(() => {
        return props.options.align === "right" ? "right" : "left";
    });

    return { flexStyle, orderStyle, justifyContentStyle, textAlignStyle }
}